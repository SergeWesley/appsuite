export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      books: {
        Row: {
          id: string
          title: string
          author: string
          cover: string | null
          status: 'reading' | 'completed' | 'toread' | 'wishlist'
          progress: number
          total_pages: number | null
          current_page: number | null
          rating: number | null
          notes: string | null
          date_added: string
          date_started: string | null
          date_completed: string | null
          genre: string | null
          isbn: string | null
          cover_url: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          author: string
          cover?: string | null
          status: 'reading' | 'completed' | 'toread' | 'wishlist'
          progress?: number
          total_pages?: number | null
          current_page?: number | null
          rating?: number | null
          notes?: string | null
          date_added?: string
          date_started?: string | null
          date_completed?: string | null
          genre?: string | null
          isbn?: string | null
          cover_url?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          author?: string
          cover?: string | null
          status?: 'reading' | 'completed' | 'toread' | 'wishlist'
          progress?: number
          total_pages?: number | null
          current_page?: number | null
          rating?: number | null
          notes?: string | null
          date_added?: string
          date_started?: string | null
          date_completed?: string | null
          genre?: string | null
          isbn?: string | null
          cover_url?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      reading_sessions: {
        Row: {
          id: string
          book_id: string
          start_time: string
          end_time: string | null
          duration: number
          notes: string | null
          pages_read: number | null
          is_active: boolean
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          book_id: string
          start_time?: string
          end_time?: string | null
          duration?: number
          notes?: string | null
          pages_read?: number | null
          is_active?: boolean
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          book_id?: string
          start_time?: string
          end_time?: string | null
          duration?: number
          notes?: string | null
          pages_read?: number | null
          is_active?: boolean
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      medias: {
        Row: {
          id: string
          title: string
          original_title: string | null
          type: 'movie' | 'series' | 'anime' | 'documentary' | 'short'
          status: 'watching' | 'completed' | 'towatch' | 'wishlist' | 'dropped'
          progress: number
          director: string | null
          creator: string | null
          studio: string | null
          duration: number | null
          year: number | null
          total_episodes: number | null
          current_episode: number | null
          total_seasons: number | null
          current_season: number | null
          rating: number | null
          notes: string | null
          genre: string | null
          country: string | null
          language: string | null
          poster: string | null
          poster_url: string | null
          imdb_id: string | null
          tmdb_id: string | null
          date_added: string
          date_started: string | null
          date_completed: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          original_title?: string | null
          type: 'movie' | 'series' | 'anime' | 'documentary' | 'short'
          status?: 'watching' | 'completed' | 'towatch' | 'wishlist' | 'dropped'
          progress?: number
          director?: string | null
          creator?: string | null
          studio?: string | null
          duration?: number | null
          year?: number | null
          total_episodes?: number | null
          current_episode?: number | null
          total_seasons?: number | null
          current_season?: number | null
          rating?: number | null
          notes?: string | null
          genre?: string | null
          country?: string | null
          language?: string | null
          poster?: string | null
          poster_url?: string | null
          imdb_id?: string | null
          tmdb_id?: string | null
          date_added?: string
          date_started?: string | null
          date_completed?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          original_title?: string | null
          type?: 'movie' | 'series' | 'anime' | 'documentary' | 'short'
          status?: 'watching' | 'completed' | 'towatch' | 'wishlist' | 'dropped'
          progress?: number
          director?: string | null
          creator?: string | null
          studio?: string | null
          duration?: number | null
          year?: number | null
          total_episodes?: number | null
          current_episode?: number | null
          total_seasons?: number | null
          current_season?: number | null
          rating?: number | null
          notes?: string | null
          genre?: string | null
          country?: string | null
          language?: string | null
          poster?: string | null
          poster_url?: string | null
          imdb_id?: string | null
          tmdb_id?: string | null
          date_added?: string
          date_started?: string | null
          date_completed?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      watching_sessions: {
        Row: {
          id: string
          media_id: string
          start_time: string
          end_time: string | null
          duration: number | null
          notes: string | null
          episode_watched: number | null
          season_watched: number | null
          is_active: boolean
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          media_id: string
          start_time?: string
          end_time?: string | null
          duration?: number | null
          notes?: string | null
          episode_watched?: number | null
          season_watched?: number | null
          is_active?: boolean
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          media_id?: string
          start_time?: string
          end_time?: string | null
          duration?: number | null
          notes?: string | null
          episode_watched?: number | null
          season_watched?: number | null
          is_active?: boolean
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          name: string
          muscle_group: 'upper_body' | 'lower_body' | 'cardio' | 'core' | 'full_body' | 'other'
          description: string | null
          is_custom: boolean
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          muscle_group: 'upper_body' | 'lower_body' | 'cardio' | 'core' | 'full_body' | 'other'
          description?: string | null
          is_custom?: boolean
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          muscle_group?: 'upper_body' | 'lower_body' | 'cardio' | 'core' | 'full_body' | 'other'
          description?: string | null
          is_custom?: boolean
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workout_sessions: {
        Row: {
          id: string
          user_id: string
          date: string
          notes: string | null
          total_exercises: number
          duration: number | null
          template_id: string | null
          is_from_template: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          notes?: string | null
          total_exercises?: number
          duration?: number | null
          template_id?: string | null
          is_from_template?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          notes?: string | null
          total_exercises?: number
          duration?: number | null
          template_id?: string | null
          is_from_template?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      workout_templates: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          recurrence_type: 'none' | 'daily' | 'weekly' | 'monthly'
          recurrence_interval: number | null
          recurrence_days_of_week: string[] | null
          recurrence_end_date: string | null
          recurrence_max_occurrences: number | null
          start_date: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          recurrence_type: 'none' | 'daily' | 'weekly' | 'monthly'
          recurrence_interval?: number | null
          recurrence_days_of_week?: string[] | null
          recurrence_end_date?: string | null
          recurrence_max_occurrences?: number | null
          start_date: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          recurrence_type?: 'none' | 'daily' | 'weekly' | 'monthly'
          recurrence_interval?: number | null
          recurrence_days_of_week?: string[] | null
          recurrence_end_date?: string | null
          recurrence_max_occurrences?: number | null
          start_date?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      workout_template_exercises: {
        Row: {
          id: string
          template_id: string
          exercise_id: string
          sets: number | null
          reps: number | null
          weight: number | null
          duration: number | null
          notes: string | null
          exercise_order: number
          created_at: string
        }
        Insert: {
          id?: string
          template_id: string
          exercise_id: string
          sets?: number | null
          reps?: number | null
          weight?: number | null
          duration?: number | null
          notes?: string | null
          exercise_order: number
          created_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          exercise_id?: string
          sets?: number | null
          reps?: number | null
          weight?: number | null
          duration?: number | null
          notes?: string | null
          exercise_order?: number
          created_at?: string
        }
      }
      workout_exercises: {
        Row: {
          id: string
          workout_session_id: string
          exercise_id: string
          sets: number | null
          reps: number | null
          weight: number | null
          duration: number | null
          notes: string | null
          exercise_order: number
          created_at: string
        }
        Insert: {
          id?: string
          workout_session_id: string
          exercise_id: string
          sets?: number | null
          reps?: number | null
          weight?: number | null
          duration?: number | null
          notes?: string | null
          exercise_order: number
          created_at?: string
        }
        Update: {
          id?: string
          workout_session_id?: string
          exercise_id?: string
          sets?: number | null
          reps?: number | null
          weight?: number | null
          duration?: number | null
          notes?: string | null
          exercise_order?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
