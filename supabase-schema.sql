-- Enable RLS (Row Level Security)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Créer la table des livres
CREATE TABLE books (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  cover TEXT,
  status TEXT NOT NULL CHECK (status IN ('reading', 'completed', 'toread')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  total_pages INTEGER,
  current_page INTEGER,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_started TIMESTAMP WITH TIME ZONE,
  date_completed TIMESTAMP WITH TIME ZONE,
  genre TEXT,
  isbn TEXT,
  cover_url TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table des sessions de lecture
CREATE TABLE reading_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER DEFAULT 0, -- en secondes
  notes TEXT,
  pages_read INTEGER,
  is_active BOOLEAN DEFAULT false,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS sur les tables
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS pour la table books
CREATE POLICY "Users can view their own books" ON books
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own books" ON books
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own books" ON books
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own books" ON books
  FOR DELETE USING (auth.uid() = user_id);

-- Créer les politiques RLS pour la table reading_sessions
CREATE POLICY "Users can view their own reading sessions" ON reading_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reading sessions" ON reading_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading sessions" ON reading_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reading sessions" ON reading_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Créer les index pour optimiser les performances
CREATE INDEX books_user_id_idx ON books(user_id);
CREATE INDEX books_status_idx ON books(status);
CREATE INDEX reading_sessions_user_id_idx ON reading_sessions(user_id);
CREATE INDEX reading_sessions_book_id_idx ON reading_sessions(book_id);
CREATE INDEX reading_sessions_is_active_idx ON reading_sessions(is_active);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer les triggers pour updated_at
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_sessions_updated_at BEFORE UPDATE ON reading_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
