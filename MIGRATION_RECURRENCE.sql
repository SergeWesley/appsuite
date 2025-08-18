-- Migration simple pour ajouter la récurrence aux workout_sessions
-- À exécuter dans l'éditeur SQL de Supabase

-- ========================================
-- AJOUT DES COLONNES DE RÉCURRENCE
-- ========================================

-- Ajouter les colonnes de récurrence à la table workout_sessions existante
ALTER TABLE workout_sessions 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT CHECK (recurrence_pattern IN ('none', 'daily', 'weekly', 'monthly')),
ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER DEFAULT 1 CHECK (recurrence_interval > 0),
ADD COLUMN IF NOT EXISTS recurrence_days INTEGER[],
ADD COLUMN IF NOT EXISTS recurrence_end_date DATE,
ADD COLUMN IF NOT EXISTS parent_session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_generated BOOLEAN DEFAULT FALSE;

-- ========================================
-- INDEX POUR LES PERFORMANCES
-- ========================================

-- Index pour améliorer les requêtes de récurrence
CREATE INDEX IF NOT EXISTS idx_workout_sessions_recurring ON workout_sessions(user_id, is_recurring) WHERE is_recurring = true;
CREATE INDEX IF NOT EXISTS idx_workout_sessions_generated ON workout_sessions(parent_session_id) WHERE parent_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workout_sessions_pattern ON workout_sessions(recurrence_pattern) WHERE recurrence_pattern != 'none';
CREATE INDEX IF NOT EXISTS idx_workout_sessions_dates ON workout_sessions(user_id, date);

-- ========================================
-- CONTRAINTES DE DONNÉES
-- ========================================

-- Contrainte : si récurrence activée, pattern obligatoire
ALTER TABLE workout_sessions 
ADD CONSTRAINT check_recurrence_pattern 
CHECK (
  (is_recurring = false OR is_recurring IS NULL) OR 
  (is_recurring = true AND recurrence_pattern IS NOT NULL AND recurrence_pattern != 'none')
);

-- Contrainte : date de fin >= date de début
ALTER TABLE workout_sessions 
ADD CONSTRAINT check_recurrence_end_date 
CHECK (recurrence_end_date IS NULL OR recurrence_end_date >= date);

-- Contrainte : jours de semaine valides (0-6)
ALTER TABLE workout_sessions 
ADD CONSTRAINT check_recurrence_days 
CHECK (
  recurrence_days IS NULL OR 
  (array_length(recurrence_days, 1) > 0 AND 
   NOT EXISTS (SELECT 1 FROM unnest(recurrence_days) AS day WHERE day < 0 OR day > 6))
);

-- ========================================
-- FONCTION UTILE POUR GÉNÉRER RÉCURRENCE
-- ========================================

-- Fonction pour calculer les prochaines dates de récurrence
CREATE OR REPLACE FUNCTION calculate_next_recurrence_dates(
    p_start_date DATE,
    p_end_date DATE,
    p_pattern TEXT,
    p_interval INTEGER,
    p_week_days INTEGER[],
    p_limit INTEGER DEFAULT 20
)
RETURNS DATE[] AS $$
DECLARE
    result_dates DATE[] := '{}';
    current_date DATE := p_start_date + INTERVAL '1 day';
    end_date DATE := COALESCE(p_end_date, p_start_date + INTERVAL '1 year');
    week_start DATE;
    target_date DATE;
    day_of_week INTEGER;
BEGIN
    WHILE current_date <= end_date AND array_length(result_dates, 1) < p_limit LOOP
        CASE p_pattern
            WHEN 'daily' THEN
                result_dates := array_append(result_dates, current_date);
                current_date := current_date + (p_interval || ' days')::INTERVAL;
                
            WHEN 'weekly' THEN
                IF p_week_days IS NOT NULL AND array_length(p_week_days, 1) > 0 THEN
                    -- Calculer le début de la semaine (dimanche)
                    week_start := current_date - (EXTRACT(DOW FROM current_date) || ' days')::INTERVAL;
                    
                    -- Pour chaque jour de la semaine sélectionné
                    FOR i IN 1..array_length(p_week_days, 1) LOOP
                        target_date := week_start + (p_week_days[i] || ' days')::INTERVAL;
                        
                        IF target_date >= current_date AND target_date <= end_date AND 
                           array_length(result_dates, 1) < p_limit THEN
                            result_dates := array_append(result_dates, target_date);
                        END IF;
                    END LOOP;
                    
                    -- Passer à la semaine suivante selon l'intervalle
                    current_date := current_date + (7 * p_interval || ' days')::INTERVAL;
                ELSE
                    result_dates := array_append(result_dates, current_date);
                    current_date := current_date + (7 * p_interval || ' days')::INTERVAL;
                END IF;
                
            WHEN 'monthly' THEN
                result_dates := array_append(result_dates, current_date);
                current_date := current_date + (p_interval || ' months')::INTERVAL;
                
            ELSE
                EXIT; -- Pattern non supporté
        END CASE;
    END LOOP;
    
    RETURN result_dates;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- FONCTION POUR GÉNÉRER SÉANCES AUTO
-- ========================================

-- Fonction pour générer automatiquement les séances récurrentes
CREATE OR REPLACE FUNCTION generate_recurring_sessions(
    p_parent_session_id UUID,
    p_limit INTEGER DEFAULT 20
)
RETURNS INTEGER AS $$
DECLARE
    parent_session RECORD;
    next_dates DATE[];
    session_date DATE;
    new_session_id UUID;
    exercise_record RECORD;
    generated_count INTEGER := 0;
BEGIN
    -- Récupérer la séance parente
    SELECT * INTO parent_session 
    FROM workout_sessions 
    WHERE id = p_parent_session_id AND is_recurring = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Session parente récurrente non trouvée';
    END IF;
    
    -- Calculer les prochaines dates
    next_dates := calculate_next_recurrence_dates(
        parent_session.date,
        parent_session.recurrence_end_date,
        parent_session.recurrence_pattern,
        parent_session.recurrence_interval,
        parent_session.recurrence_days,
        p_limit
    );
    
    -- Générer chaque séance
    FOREACH session_date IN ARRAY next_dates LOOP
        -- Vérifier si cette date n'existe pas déjà
        IF NOT EXISTS (
            SELECT 1 FROM workout_sessions 
            WHERE parent_session_id = p_parent_session_id 
            AND date = session_date
        ) THEN
            -- Créer la nouvelle séance
            INSERT INTO workout_sessions (
                user_id, date, notes, total_exercises, duration,
                is_recurring, recurrence_pattern, parent_session_id, is_generated
            )
            VALUES (
                parent_session.user_id, session_date, parent_session.notes, 
                parent_session.total_exercises, parent_session.duration,
                false, 'none', p_parent_session_id, true
            )
            RETURNING id INTO new_session_id;
            
            -- Copier les exercices
            FOR exercise_record IN 
                SELECT * FROM workout_exercises 
                WHERE workout_session_id = p_parent_session_id
            LOOP
                INSERT INTO workout_exercises (
                    workout_session_id, exercise_id, sets, reps, weight, 
                    duration, notes, exercise_order
                )
                VALUES (
                    new_session_id, exercise_record.exercise_id, exercise_record.sets,
                    exercise_record.reps, exercise_record.weight, exercise_record.duration,
                    exercise_record.notes, exercise_record.exercise_order
                );
            END LOOP;
            
            generated_count := generated_count + 1;
        END IF;
    END LOOP;
    
    RETURN generated_count;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- TRIGGER POUR GÉNÉRATION AUTOMATIQUE
-- ========================================

-- Fonction trigger pour générer automatiquement les séances lors de l'insertion
CREATE OR REPLACE FUNCTION trigger_generate_recurring_sessions()
RETURNS TRIGGER AS $$
BEGIN
    -- Si la séance est récurrente, générer automatiquement les suivantes
    IF NEW.is_recurring = true AND NEW.recurrence_pattern != 'none' AND NEW.parent_session_id IS NULL THEN
        -- Utiliser pg_notify pour déclencher la génération en arrière-plan
        PERFORM pg_notify('generate_sessions', NEW.id::text);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS auto_generate_recurring_sessions ON workout_sessions;
CREATE TRIGGER auto_generate_recurring_sessions
    AFTER INSERT ON workout_sessions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generate_recurring_sessions();

-- ========================================
-- MISE À JOUR DES POLITIQUES RLS
-- ========================================

-- Les politiques existantes devraient automatiquement s'appliquer aux nouvelles colonnes
-- mais on peut les vérifier si nécessaire

-- Vérifier que les politiques RLS sont toujours actives
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'workout_sessions';

-- ========================================
-- DONNÉES DE TEST (OPTIONNEL)
-- ========================================

-- Exemple de séance récurrente pour tester
/*
-- Insérer une séance récurrente de test (remplacer les UUIDs par des vrais)
INSERT INTO workout_sessions (
    user_id, date, notes, total_exercises, 
    is_recurring, recurrence_pattern, recurrence_interval, recurrence_days
) VALUES (
    'your-user-id-here',
    CURRENT_DATE,
    'Séance test récurrente',
    3,
    true,
    'weekly',
    1,
    ARRAY[1, 3, 5]  -- Lundi, Mercredi, Vendredi
);

-- Tester la génération
SELECT generate_recurring_sessions('session-id-here', 10);
*/

-- ========================================
-- VÉRIFICATIONS POST-MIGRATION
-- ========================================

-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'workout_sessions' 
AND column_name IN (
    'is_recurring', 'recurrence_pattern', 'recurrence_interval', 
    'recurrence_days', 'recurrence_end_date', 'parent_session_id', 'is_generated'
)
ORDER BY ordinal_position;

-- Vérifier les contraintes
SELECT conname, contype, confupdtype, confdeltype
FROM pg_constraint 
WHERE conrelid = 'workout_sessions'::regclass
AND conname LIKE '%recur%';

-- Vérifier les index
SELECT indexname, indexdef
FROM pg_indexes 
WHERE tablename = 'workout_sessions' 
AND indexname LIKE '%recur%';

-- ========================================
-- NOTES D'IMPLÉMENTATION
-- ========================================

/*
FONCTIONNALITÉS AJOUTÉES :

✅ Récurrence quotidienne, hebdomadaire, mensuelle
✅ Sélection des jours de la semaine
✅ Date de fin optionnelle
✅ Génération automatique des séances
✅ Lien parent/enfant entre séances
✅ Contraintes de données robustes
✅ Index pour les performances
✅ Fonctions utilitaires SQL

UTILISATION :

1. Créer une séance avec is_recurring = true
2. La fonction SQL génère automatiquement les suivantes
3. L'application peut aussi utiliser generateRecurringSessions()
4. Les séances générées sont liées via parent_session_id

PERFORMANCE :

- Index optimisés pour les requêtes fréquentes
- Génération limitée à 20 séances par défaut
- Requêtes efficaces pour afficher le calendrier

EXTENSIBILITÉ :

Le modèle permet facilement d'ajouter :
- Patterns de récurrence personnalisés
- Exceptions dans la récurrence
- Modifications en lot des séances générées
- Statistiques de récurrence

COMPATIBILITÉ :

- Toutes les séances existantes restent inchangées
- Les nouveaux champs sont optionnels
- L'API existante continue de fonctionner
*/

-- FIN DE LA MIGRATION
