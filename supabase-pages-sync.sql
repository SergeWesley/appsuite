-- Migration pour synchroniser automatiquement les pages lues
-- Quand une session de lecture est créée/modifiée, met à jour le current_page du livre

-- 1. Fonction pour synchroniser les pages lues du livre
CREATE OR REPLACE FUNCTION sync_book_pages_read()
RETURNS TRIGGER AS $$
DECLARE
  v_total_pages_read INTEGER;
  v_book_total_pages INTEGER;
  v_new_progress INTEGER;
BEGIN
  -- Si une session est supprimée, recalculer à partir de toutes les sessions restantes
  IF TG_OP = 'DELETE' THEN
    -- Calculer le total des pages lues pour ce livre
    SELECT COALESCE(SUM(pages_read), 0)
    INTO v_total_pages_read
    FROM reading_sessions
    WHERE book_id = OLD.book_id 
      AND user_id = OLD.user_id
      AND pages_read IS NOT NULL;
      
    -- Mettre à jour le livre avec le nouveau total
    UPDATE books
    SET 
      current_page = v_total_pages_read,
      updated_at = NOW()
    WHERE id = OLD.book_id AND user_id = OLD.user_id;
    
    RETURN OLD;
  END IF;

  -- Pour INSERT et UPDATE, utiliser NEW
  IF NEW.pages_read IS NOT NULL AND NEW.pages_read > 0 THEN
    -- Calculer le total des pages lues pour ce livre
    SELECT COALESCE(SUM(pages_read), 0)
    INTO v_total_pages_read
    FROM reading_sessions
    WHERE book_id = NEW.book_id 
      AND user_id = NEW.user_id
      AND pages_read IS NOT NULL;
      
    -- Récupérer le nombre total de pages du livre pour calculer le progrès
    SELECT total_pages
    INTO v_book_total_pages
    FROM books
    WHERE id = NEW.book_id AND user_id = NEW.user_id;
    
    -- Calculer le nouveau progrès (0-100%)
    IF v_book_total_pages IS NOT NULL AND v_book_total_pages > 0 THEN
      v_new_progress := LEAST(100, (v_total_pages_read * 100) / v_book_total_pages);
    ELSE
      v_new_progress := 0;
    END IF;
    
    -- Mettre à jour le livre
    UPDATE books
    SET 
      current_page = v_total_pages_read,
      progress = v_new_progress,
      status = CASE 
        WHEN v_new_progress >= 100 THEN 'completed'
        WHEN v_new_progress > 0 AND status = 'toread' THEN 'reading'
        ELSE status
      END,
      date_completed = CASE 
        WHEN v_new_progress >= 100 AND date_completed IS NULL THEN NOW()
        ELSE date_completed
      END,
      updated_at = NOW()
    WHERE id = NEW.book_id AND user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Créer le trigger pour synchroniser automatiquement
DROP TRIGGER IF EXISTS sync_book_pages_trigger ON reading_sessions;
CREATE TRIGGER sync_book_pages_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reading_sessions
  FOR EACH ROW
  EXECUTE FUNCTION sync_book_pages_read();

-- 3. Fonction pour recalculer manuellement les pages d'un livre (utile pour les données existantes)
CREATE OR REPLACE FUNCTION recalculate_book_pages(
  p_book_id UUID,
  p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_total_pages_read INTEGER;
  v_book_total_pages INTEGER;
  v_new_progress INTEGER;
BEGIN
  -- Calculer le total des pages lues pour ce livre
  SELECT COALESCE(SUM(pages_read), 0)
  INTO v_total_pages_read
  FROM reading_sessions
  WHERE book_id = p_book_id 
    AND user_id = p_user_id
    AND pages_read IS NOT NULL;
    
  -- Récupérer le nombre total de pages du livre
  SELECT total_pages
  INTO v_book_total_pages
  FROM books
  WHERE id = p_book_id AND user_id = p_user_id;
  
  -- Calculer le progrès
  IF v_book_total_pages IS NOT NULL AND v_book_total_pages > 0 THEN
    v_new_progress := LEAST(100, (v_total_pages_read * 100) / v_book_total_pages);
  ELSE
    v_new_progress := 0;
  END IF;
  
  -- Mettre à jour le livre
  UPDATE books
  SET 
    current_page = v_total_pages_read,
    progress = v_new_progress,
    status = CASE 
      WHEN v_new_progress >= 100 THEN 'completed'
      WHEN v_new_progress > 0 AND status = 'toread' THEN 'reading'
      ELSE status
    END,
    date_completed = CASE 
      WHEN v_new_progress >= 100 AND date_completed IS NULL THEN NOW()
      ELSE date_completed
    END,
    updated_at = NOW()
  WHERE id = p_book_id AND user_id = p_user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Fonction pour recalculer tous les livres d'un utilisateur
CREATE OR REPLACE FUNCTION recalculate_all_books_pages(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_book_record RECORD;
  v_count INTEGER := 0;
BEGIN
  -- Parcourir tous les livres de l'utilisateur
  FOR v_book_record IN 
    SELECT id FROM books WHERE user_id = p_user_id
  LOOP
    PERFORM recalculate_book_pages(v_book_record.id, p_user_id);
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Index pour optimiser les requêtes de synchronisation
CREATE INDEX IF NOT EXISTS idx_reading_sessions_book_pages 
ON reading_sessions (book_id, user_id) 
WHERE pages_read IS NOT NULL;

-- Commentaires sur l'utilisation :
-- 
-- 1. Le trigger se déclenche automatiquement à chaque modification de reading_sessions
-- 2. Il met à jour current_page avec la somme de toutes les pages lues
-- 3. Il recalcule automatiquement le progrès (progress) en pourcentage
-- 4. Il change automatiquement le statut du livre :
--    - 'toread' → 'reading' quand on commence à lire
--    - → 'completed' quand on atteint 100% du livre
-- 5. Il définit automatiquement date_completed quand le livre est terminé
--
-- Pour recalculer manuellement un livre :
-- SELECT recalculate_book_pages('uuid-du-livre', 'uuid-utilisateur');
--
-- Pour recalculer tous les livres d'un utilisateur :
-- SELECT recalculate_all_books_pages('uuid-utilisateur');
