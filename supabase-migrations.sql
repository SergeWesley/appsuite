-- Migration pour les sessions de lecture avec timer
-- Ce script ajoute la logique pour gérer les sessions uniques par livre

-- 1. Fonction pour démarrer une session (arrête automatiquement les sessions actives du même livre)
CREATE OR REPLACE FUNCTION start_reading_session(
  p_book_id UUID,
  p_user_id UUID
) RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
  v_existing_session_id UUID;
BEGIN
  -- Vérifier s'il y a déjà une session active pour ce livre
  SELECT id INTO v_existing_session_id
  FROM reading_sessions
  WHERE book_id = p_book_id 
    AND user_id = p_user_id 
    AND is_active = true;

  -- Si une session active existe, la terminer
  IF v_existing_session_id IS NOT NULL THEN
    UPDATE reading_sessions
    SET 
      is_active = false,
      end_time = NOW(),
      duration = EXTRACT(EPOCH FROM (NOW() - start_time))::INTEGER
    WHERE id = v_existing_session_id;
  END IF;

  -- Créer une nouvelle session
  INSERT INTO reading_sessions (
    book_id,
    user_id,
    start_time,
    duration,
    is_active
  ) VALUES (
    p_book_id,
    p_user_id,
    NOW(),
    0,
    true
  ) RETURNING id INTO v_session_id;

  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fonction pour arrêter une session
CREATE OR REPLACE FUNCTION stop_reading_session(
  p_session_id UUID,
  p_user_id UUID,
  p_notes TEXT DEFAULT NULL,
  p_pages_read INTEGER DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_start_time TIMESTAMP WITH TIME ZONE;
  v_duration INTEGER;
BEGIN
  -- Récupérer l'heure de début pour calculer la durée
  SELECT start_time INTO v_start_time
  FROM reading_sessions
  WHERE id = p_session_id 
    AND user_id = p_user_id 
    AND is_active = true;

  -- Si la session n'existe pas ou n'est pas active
  IF v_start_time IS NULL THEN
    RETURN false;
  END IF;

  -- Calculer la durée en secondes
  v_duration := EXTRACT(EPOCH FROM (NOW() - v_start_time))::INTEGER;

  -- Mettre à jour la session
  UPDATE reading_sessions
  SET 
    is_active = false,
    end_time = NOW(),
    duration = v_duration,
    notes = COALESCE(p_notes, notes),
    pages_read = COALESCE(p_pages_read, pages_read)
  WHERE id = p_session_id AND user_id = p_user_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Fonction pour obtenir la session active d'un livre
CREATE OR REPLACE FUNCTION get_active_session(
  p_book_id UUID,
  p_user_id UUID
) RETURNS TABLE (
  session_id UUID,
  start_time TIMESTAMP WITH TIME ZONE,
  current_duration INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rs.id,
    rs.start_time,
    EXTRACT(EPOCH FROM (NOW() - rs.start_time))::INTEGER as current_duration
  FROM reading_sessions rs
  WHERE rs.book_id = p_book_id 
    AND rs.user_id = p_user_id 
    AND rs.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Fonction pour nettoyer les sessions actives trop anciennes (> 24h)
CREATE OR REPLACE FUNCTION cleanup_stale_sessions()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE reading_sessions
  SET 
    is_active = false,
    end_time = start_time + INTERVAL '24 hours',
    duration = 86400 -- 24 heures en secondes
  WHERE 
    is_active = true 
    AND start_time < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger pour empêcher la création manuelle de sessions multiples
CREATE OR REPLACE FUNCTION prevent_multiple_active_sessions()
RETURNS TRIGGER AS $$
BEGIN
  -- Si on essaie d'insérer une session active
  IF NEW.is_active = true THEN
    -- Vérifier s'il y a déjà une session active pour ce livre
    IF EXISTS (
      SELECT 1 
      FROM reading_sessions 
      WHERE book_id = NEW.book_id 
        AND user_id = NEW.user_id 
        AND is_active = true 
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
    ) THEN
      RAISE EXCEPTION 'Une session de lecture est déjà active pour ce livre. Utilisez la fonction start_reading_session().';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS prevent_multiple_sessions_trigger ON reading_sessions;
CREATE TRIGGER prevent_multiple_sessions_trigger
  BEFORE INSERT OR UPDATE ON reading_sessions
  FOR EACH ROW
  EXECUTE FUNCTION prevent_multiple_active_sessions();

-- 6. Index pour optimiser les requêtes sur les sessions actives
CREATE INDEX IF NOT EXISTS idx_reading_sessions_active_book_user 
ON reading_sessions (book_id, user_id, is_active) 
WHERE is_active = true;

-- 7. Fonction pour obtenir toutes les sessions actives d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_active_sessions(p_user_id UUID)
RETURNS TABLE (
  session_id UUID,
  book_id UUID,
  book_title TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  current_duration INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rs.id,
    rs.book_id,
    b.title,
    rs.start_time,
    EXTRACT(EPOCH FROM (NOW() - rs.start_time))::INTEGER as current_duration
  FROM reading_sessions rs
  JOIN books b ON b.id = rs.book_id
  WHERE rs.user_id = p_user_id 
    AND rs.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Politique RLS pour les nouvelles fonctions
-- Les fonctions utilisent SECURITY DEFINER, donc elles ont les droits nécessaires
-- mais on s'assure que les utilisateurs ne peuvent appeler les fonctions que pour leurs propres données

-- Commenter car les politiques RLS existent déjà dans le schéma principal
-- mais s'assurer qu'elles couvrent bien tous les cas d'usage
