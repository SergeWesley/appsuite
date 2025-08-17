-- Migration pour ajouter le support des séances récurrentes
-- À exécuter dans l'ordre sur votre base de données Supabase

-- 1. Modifier la table workout_sessions pour ajouter le support des templates
ALTER TABLE workout_sessions 
ADD COLUMN template_id UUID REFERENCES workout_templates(id) ON DELETE SET NULL,
ADD COLUMN is_from_template BOOLEAN DEFAULT FALSE;

-- 2. Créer la table des templates de séances
CREATE TABLE workout_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    recurrence_type VARCHAR(20) NOT NULL CHECK (recurrence_type IN ('none', 'daily', 'weekly', 'monthly')),
    recurrence_interval INTEGER,
    recurrence_days_of_week TEXT[], -- Array of day names: ['monday', 'tuesday', ...]
    recurrence_end_date DATE,
    recurrence_max_occurrences INTEGER,
    start_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Créer la table des exercices de templates
CREATE TABLE workout_template_exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES workout_templates(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    sets INTEGER,
    reps INTEGER,
    weight DECIMAL(5,2), -- Poids en kg avec 2 décimales
    duration INTEGER, -- Durée en minutes
    notes TEXT,
    exercise_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Créer les index pour optimiser les performances
CREATE INDEX idx_workout_sessions_template_id ON workout_sessions(template_id);
CREATE INDEX idx_workout_sessions_user_date ON workout_sessions(user_id, date);
CREATE INDEX idx_workout_templates_user_active ON workout_templates(user_id, is_active);
CREATE INDEX idx_workout_templates_recurrence ON workout_templates(recurrence_type, is_active);
CREATE INDEX idx_workout_template_exercises_template_id ON workout_template_exercises(template_id);
CREATE INDEX idx_workout_template_exercises_order ON workout_template_exercises(template_id, exercise_order);

-- 5. Créer une fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Ajouter le trigger pour workout_templates
CREATE TRIGGER update_workout_templates_updated_at 
    BEFORE UPDATE ON workout_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Ajouter les politiques RLS (Row Level Security) pour workout_templates
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workout templates" ON workout_templates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout templates" ON workout_templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout templates" ON workout_templates
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout templates" ON workout_templates
    FOR DELETE USING (auth.uid() = user_id);

-- 8. Ajouter les politiques RLS pour workout_template_exercises
ALTER TABLE workout_template_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workout template exercises" ON workout_template_exercises
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workout_templates 
            WHERE workout_templates.id = workout_template_exercises.template_id 
            AND workout_templates.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own workout template exercises" ON workout_template_exercises
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM workout_templates 
            WHERE workout_templates.id = workout_template_exercises.template_id 
            AND workout_templates.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own workout template exercises" ON workout_template_exercises
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM workout_templates 
            WHERE workout_templates.id = workout_template_exercises.template_id 
            AND workout_templates.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own workout template exercises" ON workout_template_exercises
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM workout_templates 
            WHERE workout_templates.id = workout_template_exercises.template_id 
            AND workout_templates.user_id = auth.uid()
        )
    );

-- 9. Créer une vue pour simplifier les requêtes de templates avec exercices
CREATE VIEW workout_templates_with_exercises AS
SELECT 
    wt.*,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'id', wte.id,
                'exercise_id', wte.exercise_id,
                'exercise_name', e.name,
                'muscle_group', e.muscle_group,
                'sets', wte.sets,
                'reps', wte.reps,
                'weight', wte.weight,
                'duration', wte.duration,
                'notes', wte.notes,
                'exercise_order', wte.exercise_order
            ) ORDER BY wte.exercise_order
        ) FILTER (WHERE wte.id IS NOT NULL), 
        '[]'::JSON
    ) AS exercises
FROM workout_templates wt
LEFT JOIN workout_template_exercises wte ON wt.id = wte.template_id
LEFT JOIN exercises e ON wte.exercise_id = e.id
WHERE wt.is_active = true
GROUP BY wt.id, wt.user_id, wt.name, wt.description, wt.recurrence_type, 
         wt.recurrence_interval, wt.recurrence_days_of_week, wt.recurrence_end_date, 
         wt.recurrence_max_occurrences, wt.start_date, wt.is_active, wt.created_at, wt.updated_at;

-- 10. Fonction utilitaire pour générer les prochaines occurrences d'un template
CREATE OR REPLACE FUNCTION get_template_next_occurrences(
    template_id_param UUID,
    from_date DATE DEFAULT CURRENT_DATE,
    to_date DATE DEFAULT CURRENT_DATE + INTERVAL '1 month',
    max_occurrences INTEGER DEFAULT 50
)
RETURNS TABLE (
    template_id UUID,
    template_name VARCHAR(255),
    occurrence_date DATE,
    has_session BOOLEAN
) AS $$
DECLARE
    template_record RECORD;
    current_date DATE;
    occurrence_count INTEGER := 0;
    interval_days INTEGER;
BEGIN
    -- Récupérer les informations du template
    SELECT * INTO template_record 
    FROM workout_templates 
    WHERE id = template_id_param AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Calculer l'intervalle en jours selon le type de récurrence
    CASE template_record.recurrence_type
        WHEN 'daily' THEN
            interval_days := COALESCE(template_record.recurrence_interval, 1);
        WHEN 'weekly' THEN
            interval_days := COALESCE(template_record.recurrence_interval, 1) * 7;
        WHEN 'monthly' THEN
            interval_days := COALESCE(template_record.recurrence_interval, 1) * 30; -- Approximation
        ELSE
            RETURN; -- Type 'none' ou invalide
    END CASE;
    
    -- Générer les occurrences
    current_date := GREATEST(template_record.start_date, from_date);
    
    WHILE current_date <= to_date 
          AND occurrence_count < max_occurrences 
          AND (template_record.recurrence_end_date IS NULL OR current_date <= template_record.recurrence_end_date)
          AND (template_record.recurrence_max_occurrences IS NULL OR occurrence_count < template_record.recurrence_max_occurrences)
    LOOP
        -- Vérifier si une séance existe déjà pour cette date et ce template
        template_id := template_id_param;
        template_name := template_record.name;
        occurrence_date := current_date;
        has_session := EXISTS(
            SELECT 1 FROM workout_sessions 
            WHERE template_id = template_id_param 
            AND date = current_date
        );
        
        RETURN NEXT;
        
        current_date := current_date + interval_days;
        occurrence_count := occurrence_count + 1;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- 11. Commentaires pour documentation
COMMENT ON TABLE workout_templates IS 'Templates de séances d''entraînement récurrentes';
COMMENT ON TABLE workout_template_exercises IS 'Exercices associés aux templates de séances';
COMMENT ON COLUMN workout_templates.recurrence_type IS 'Type de récurrence: none, daily, weekly, monthly';
COMMENT ON COLUMN workout_templates.recurrence_interval IS 'Intervalle de récurrence (ex: tous les 2 jours, toutes les 3 semaines)';
COMMENT ON COLUMN workout_templates.recurrence_days_of_week IS 'Jours de la semaine pour récurrence hebdomadaire';
COMMENT ON COLUMN workout_sessions.template_id IS 'ID du template si la séance provient d''un template récurrent';
COMMENT ON COLUMN workout_sessions.is_from_template IS 'Indique si la séance a été créée à partir d''un template';
