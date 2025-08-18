-- Migration pour ajouter les fonctionnalités de programmation et récurrence aux workout sessions
-- À exécuter dans l'éditeur SQL de Supabase

-- ========================================
-- 1. TABLE WORKOUT_TEMPLATES
-- ========================================

CREATE TABLE workout_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    estimated_duration INTEGER, -- en minutes
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    tags TEXT[], -- array de tags
    is_public BOOLEAN DEFAULT FALSE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_workout_templates_user_id ON workout_templates(user_id);
CREATE INDEX idx_workout_templates_is_public ON workout_templates(is_public);
CREATE INDEX idx_workout_templates_difficulty ON workout_templates(difficulty);

-- RLS (Row Level Security)
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;

-- Politique pour la lecture : utilisateur propriétaire ou templates publics
CREATE POLICY "Users can view own templates and public templates" ON workout_templates
    FOR SELECT 
    USING (auth.uid() = user_id OR is_public = true);

-- Politique pour l'insertion : seulement son propre contenu
CREATE POLICY "Users can insert own templates" ON workout_templates
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Politique pour la mise à jour : seulement son propre contenu
CREATE POLICY "Users can update own templates" ON workout_templates
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Politique pour la suppression : seulement son propre contenu
CREATE POLICY "Users can delete own templates" ON workout_templates
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workout_templates_updated_at 
    BEFORE UPDATE ON workout_templates 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ========================================
-- 2. TABLE WORKOUT_TEMPLATE_EXERCISES
-- ========================================

CREATE TABLE workout_template_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES workout_templates(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    sets INTEGER,
    reps INTEGER,
    weight DECIMAL(5,2), -- kg avec 2 décimales
    duration INTEGER, -- minutes pour cardio
    notes TEXT,
    exercise_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_workout_template_exercises_template_id ON workout_template_exercises(template_id);
CREATE INDEX idx_workout_template_exercises_exercise_id ON workout_template_exercises(exercise_id);
CREATE INDEX idx_workout_template_exercises_order ON workout_template_exercises(template_id, exercise_order);

-- RLS (Row Level Security)
ALTER TABLE workout_template_exercises ENABLE ROW LEVEL SECURITY;

-- Politique : accès basé sur l'accès au template parent
CREATE POLICY "Users can manage template exercises based on template access" ON workout_template_exercises
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM workout_templates wt 
            WHERE wt.id = template_id 
            AND (wt.user_id = auth.uid() OR wt.is_public = true)
        )
    );

-- ========================================
-- 3. TABLE WORKOUT_PROGRAMS
-- ========================================

CREATE TABLE workout_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- durée en semaines
    level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    goals TEXT[], -- objectifs du programme
    is_public BOOLEAN DEFAULT FALSE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_workout_programs_user_id ON workout_programs(user_id);
CREATE INDEX idx_workout_programs_is_public ON workout_programs(is_public);
CREATE INDEX idx_workout_programs_level ON workout_programs(level);

-- RLS (Row Level Security)
ALTER TABLE workout_programs ENABLE ROW LEVEL SECURITY;

-- Politiques similaires aux templates
CREATE POLICY "Users can view own programs and public programs" ON workout_programs
    FOR SELECT 
    USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own programs" ON workout_programs
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own programs" ON workout_programs
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own programs" ON workout_programs
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE TRIGGER update_workout_programs_updated_at 
    BEFORE UPDATE ON workout_programs 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ========================================
-- 4. TABLE WORKOUT_PROGRAM_TEMPLATES
-- ========================================

CREATE TABLE workout_program_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES workout_programs(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES workout_templates(id) ON DELETE CASCADE,
    week INTEGER NOT NULL CHECK (week > 0), -- semaine dans le programme (1-N)
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=dimanche, 6=samedi
    order_in_day INTEGER DEFAULT 1, -- ordre si plusieurs séances le même jour
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(program_id, template_id, week, day_of_week, order_in_day)
);

-- Index pour améliorer les performances
CREATE INDEX idx_workout_program_templates_program_id ON workout_program_templates(program_id);
CREATE INDEX idx_workout_program_templates_template_id ON workout_program_templates(template_id);
CREATE INDEX idx_workout_program_templates_week_day ON workout_program_templates(program_id, week, day_of_week);

-- RLS (Row Level Security)
ALTER TABLE workout_program_templates ENABLE ROW LEVEL SECURITY;

-- Politique : accès basé sur l'accès au programme parent
CREATE POLICY "Users can manage program templates based on program access" ON workout_program_templates
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM workout_programs wp 
            WHERE wp.id = program_id 
            AND (wp.user_id = auth.uid() OR wp.is_public = true)
        )
    );

-- ========================================
-- 5. TABLE SCHEDULED_WORKOUTS
-- ========================================

CREATE TABLE scheduled_workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    template_id UUID REFERENCES workout_templates(id) ON DELETE CASCADE,
    program_id UUID REFERENCES workout_programs(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    recurrence_pattern TEXT NOT NULL CHECK (
        recurrence_pattern IN ('daily', 'weekly', 'biweekly', 'monthly', 'custom')
    ),
    recurrence_interval INTEGER DEFAULT 1 CHECK (recurrence_interval > 0),
    week_days INTEGER[], -- jours de la semaine pour récurrence weekly (0-6)
    scheduled_time TIME, -- heure prévue
    reminder_minutes INTEGER, -- rappel X minutes avant
    is_active BOOLEAN DEFAULT TRUE,
    auto_generate BOOLEAN DEFAULT TRUE, -- génère automatiquement les séances
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_template_or_program CHECK (
        (template_id IS NOT NULL AND program_id IS NULL) OR 
        (template_id IS NULL AND program_id IS NOT NULL)
    ),
    CONSTRAINT check_end_date CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Index pour améliorer les performances
CREATE INDEX idx_scheduled_workouts_user_id ON scheduled_workouts(user_id);
CREATE INDEX idx_scheduled_workouts_template_id ON scheduled_workouts(template_id);
CREATE INDEX idx_scheduled_workouts_program_id ON scheduled_workouts(program_id);
CREATE INDEX idx_scheduled_workouts_active ON scheduled_workouts(user_id, is_active);
CREATE INDEX idx_scheduled_workouts_dates ON scheduled_workouts(start_date, end_date);

-- RLS (Row Level Security)
ALTER TABLE scheduled_workouts ENABLE ROW LEVEL SECURITY;

-- Politiques pour les séances programmées
CREATE POLICY "Users can view own scheduled workouts" ON scheduled_workouts
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scheduled workouts" ON scheduled_workouts
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled workouts" ON scheduled_workouts
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled workouts" ON scheduled_workouts
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE TRIGGER update_scheduled_workouts_updated_at 
    BEFORE UPDATE ON scheduled_workouts 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ========================================
-- 6. TABLE GENERATED_WORKOUTS
-- ========================================

CREATE TABLE generated_workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheduled_workout_id UUID NOT NULL REFERENCES scheduled_workouts(id) ON DELETE CASCADE,
    workout_session_id UUID REFERENCES workout_sessions(id) ON DELETE SET NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (
        status IN ('scheduled', 'completed', 'skipped', 'rescheduled')
    ),
    skipped_reason TEXT,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    UNIQUE(scheduled_workout_id, scheduled_date, scheduled_time)
);

-- Index pour améliorer les performances
CREATE INDEX idx_generated_workouts_user_id ON generated_workouts(user_id);
CREATE INDEX idx_generated_workouts_scheduled_id ON generated_workouts(scheduled_workout_id);
CREATE INDEX idx_generated_workouts_session_id ON generated_workouts(workout_session_id);
CREATE INDEX idx_generated_workouts_date_status ON generated_workouts(user_id, scheduled_date, status);

-- RLS (Row Level Security)
ALTER TABLE generated_workouts ENABLE ROW LEVEL SECURITY;

-- Politiques pour les séances générées
CREATE POLICY "Users can view own generated workouts" ON generated_workouts
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generated workouts" ON generated_workouts
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generated workouts" ON generated_workouts
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own generated workouts" ON generated_workouts
    FOR DELETE 
    USING (auth.uid() = user_id);

-- ========================================
-- 7. VUES UTILES (OPTIONNEL)
-- ========================================

-- Vue pour obtenir les templates avec le nombre d'exercices
CREATE VIEW workout_templates_with_stats AS
SELECT 
    wt.*,
    COUNT(wte.id) as exercise_count,
    COALESCE(SUM(wte.duration), 0) as total_cardio_duration
FROM workout_templates wt
LEFT JOIN workout_template_exercises wte ON wt.id = wte.template_id
GROUP BY wt.id;

-- Vue pour obtenir les prochaines séances programmées
CREATE VIEW upcoming_scheduled_workouts AS
SELECT 
    gw.*,
    sw.name as schedule_name,
    sw.template_id,
    sw.program_id,
    wt.name as template_name,
    wp.name as program_name
FROM generated_workouts gw
JOIN scheduled_workouts sw ON gw.scheduled_workout_id = sw.id
LEFT JOIN workout_templates wt ON sw.template_id = wt.id
LEFT JOIN workout_programs wp ON sw.program_id = wp.id
WHERE gw.scheduled_date >= CURRENT_DATE
AND gw.status = 'scheduled'
AND sw.is_active = true;

-- ========================================
-- 8. FONCTIONS UTILES (OPTIONNEL)
-- ========================================

-- Fonction pour générer automatiquement les séances d'un scheduled_workout
CREATE OR REPLACE FUNCTION generate_workout_sessions(
    p_scheduled_workout_id UUID,
    p_limit INTEGER DEFAULT 30
)
RETURNS INTEGER AS $$
DECLARE
    v_scheduled_workout scheduled_workouts%ROWTYPE;
    v_current_date DATE;
    v_end_date DATE;
    v_generated_count INTEGER := 0;
    v_day_of_week INTEGER;
BEGIN
    -- Récupérer les informations de la séance programmée
    SELECT * INTO v_scheduled_workout 
    FROM scheduled_workouts 
    WHERE id = p_scheduled_workout_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Scheduled workout not found';
    END IF;
    
    v_current_date := v_scheduled_workout.start_date;
    v_end_date := COALESCE(v_scheduled_workout.end_date, v_current_date + INTERVAL '1 year');
    
    -- Générer selon le pattern de récurrence
    WHILE v_current_date <= v_end_date AND v_generated_count < p_limit LOOP
        IF v_scheduled_workout.recurrence_pattern = 'daily' THEN
            -- Insérer la séance si elle n'existe pas déjà
            INSERT INTO generated_workouts (
                scheduled_workout_id, scheduled_date, scheduled_time, user_id
            )
            SELECT 
                p_scheduled_workout_id, v_current_date, v_scheduled_workout.scheduled_time, v_scheduled_workout.user_id
            WHERE NOT EXISTS (
                SELECT 1 FROM generated_workouts 
                WHERE scheduled_workout_id = p_scheduled_workout_id 
                AND scheduled_date = v_current_date
            );
            
            v_generated_count := v_generated_count + 1;
            v_current_date := v_current_date + (v_scheduled_workout.recurrence_interval || ' days')::INTERVAL;
            
        ELSIF v_scheduled_workout.recurrence_pattern = 'weekly' THEN
            v_day_of_week := EXTRACT(DOW FROM v_current_date);
            
            -- Vérifier si ce jour est dans les jours autorisés
            IF v_scheduled_workout.week_days IS NULL OR v_day_of_week = ANY(v_scheduled_workout.week_days) THEN
                INSERT INTO generated_workouts (
                    scheduled_workout_id, scheduled_date, scheduled_time, user_id
                )
                SELECT 
                    p_scheduled_workout_id, v_current_date, v_scheduled_workout.scheduled_time, v_scheduled_workout.user_id
                WHERE NOT EXISTS (
                    SELECT 1 FROM generated_workouts 
                    WHERE scheduled_workout_id = p_scheduled_workout_id 
                    AND scheduled_date = v_current_date
                );
                
                v_generated_count := v_generated_count + 1;
            END IF;
            
            v_current_date := v_current_date + '1 day'::INTERVAL;
            
            -- Passer à la semaine suivante si nécessaire
            IF EXTRACT(DOW FROM v_current_date) = 0 THEN -- Dimanche, nouvelle semaine
                v_current_date := v_current_date + ((v_scheduled_workout.recurrence_interval - 1) * 7 || ' days')::INTERVAL;
            END IF;
            
        -- Ajouter d'autres patterns au besoin
        ELSE
            EXIT; -- Pattern non supporté
        END IF;
    END LOOP;
    
    RETURN v_generated_count;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 9. DONNÉES D'EXEMPLE (OPTIONNEL)
-- ========================================

-- Quelques templates d'exemple (à ajuster selon vos besoins)
/*
INSERT INTO workout_templates (name, description, difficulty, is_public, user_id) VALUES
('Haut du corps - Débutant', 'Séance pour débuter le renforcement du haut du corps', 'beginner', true, '00000000-0000-0000-0000-000000000000'),
('Jambes - Intermédiaire', 'Séance intensive pour les jambes', 'intermediate', true, '00000000-0000-0000-0000-000000000000'),
('Full Body - Avancé', 'Séance complète pour utilisateurs expérimentés', 'advanced', true, '00000000-0000-0000-0000-000000000000');
*/

-- ========================================
-- NOTES D'IMPLÉMENTATION
-- ========================================

/*
INSTRUCTIONS POUR L'IMPLÉMENTATION :

1. Exécuter ce script dans l'éditeur SQL de Supabase
2. Vérifier que toutes les tables ont été créées avec `\dt` ou via l'interface
3. Tester les politiques RLS en créant quelques enregistrements de test
4. Adapter les types TypeScript si nécessaire

FONCTIONNALITÉS AJOUTÉES :

✅ Templates de séances réutilisables
✅ Programmes d'entraînement multi-semaines  
✅ Planification avec récurrence (quotidien, hebdomadaire, etc.)
✅ Génération automatique de séances
✅ Gestion des séances complétées/sautées
✅ Sécurité RLS complète
✅ Index pour les performances
✅ Contraintes de données
✅ Triggers pour les timestamps

TODO APRÈS MIGRATION :

- Tester l'API avec les nouveaux hooks
- Ajouter des composants UI pour gérer les templates et programmes
- Implémenter les notifications/rappels
- Ajouter l'export/import de templates
- Créer des templates publics par défaut

PERFORMANCE :

Les index créés devraient supporter efficacement :
- Recherche de templates par utilisateur/public
- Chargement des exercices d'un template
- Récupération des séances programmées actives
- Affichage du calendrier des séances générées

EXTENSIBILITÉ :

Le modèle permet facilement d'ajouter :
- Partage de templates entre utilisateurs
- Statistiques avancées
- Coaching automatisé
- Intégration calendrier externe
*/
