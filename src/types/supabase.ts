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
          is_recurring: boolean | null
          recurrence_pattern: 'none' | 'daily' | 'weekly' | 'monthly' | null
          recurrence_interval: number | null
          recurrence_days: number[] | null
          recurrence_end_date: string | null
          parent_session_id: string | null
          is_generated: boolean | null
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
          is_recurring?: boolean | null
          recurrence_pattern?: 'none' | 'daily' | 'weekly' | 'monthly' | null
          recurrence_interval?: number | null
          recurrence_days?: number[] | null
          recurrence_end_date?: string | null
          parent_session_id?: string | null
          is_generated?: boolean | null
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
          is_recurring?: boolean | null
          recurrence_pattern?: 'none' | 'daily' | 'weekly' | 'monthly' | null
          recurrence_interval?: number | null
          recurrence_days?: number[] | null
          recurrence_end_date?: string | null
          parent_session_id?: string | null
          is_generated?: boolean | null
          created_at?: string
          updated_at?: string
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
      workout_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          estimated_duration: number | null
          difficulty: 'beginner' | 'intermediate' | 'advanced' | null
          tags: string[] | null
          is_public: boolean
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          estimated_duration?: number | null
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | null
          tags?: string[] | null
          is_public?: boolean
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          estimated_duration?: number | null
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | null
          tags?: string[] | null
          is_public?: boolean
          user_id?: string
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
      workout_programs: {
        Row: {
          id: string
          name: string
          description: string | null
          duration: number
          level: 'beginner' | 'intermediate' | 'advanced'
          goals: string[] | null
          is_public: boolean
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          duration: number
          level: 'beginner' | 'intermediate' | 'advanced'
          goals?: string[] | null
          is_public?: boolean
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          duration?: number
          level?: 'beginner' | 'intermediate' | 'advanced'
          goals?: string[] | null
          is_public?: boolean
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      workout_program_templates: {
        Row: {
          id: string
          program_id: string
          template_id: string
          week: number
          day_of_week: number
          order_in_day: number | null
          created_at: string
        }
        Insert: {
          id?: string
          program_id: string
          template_id: string
          week: number
          day_of_week: number
          order_in_day?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          program_id?: string
          template_id?: string
          week?: number
          day_of_week?: number
          order_in_day?: number | null
          created_at?: string
        }
      }
      scheduled_workouts: {
        Row: {
          id: string
          name: string
          template_id: string | null
          program_id: string | null
          start_date: string
          end_date: string | null
          recurrence_pattern: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom'
          recurrence_interval: number
          week_days: number[] | null
          scheduled_time: string | null
          reminder_minutes: number | null
          is_active: boolean
          auto_generate: boolean
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          template_id?: string | null
          program_id?: string | null
          start_date: string
          end_date?: string | null
          recurrence_pattern: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom'
          recurrence_interval?: number
          week_days?: number[] | null
          scheduled_time?: string | null
          reminder_minutes?: number | null
          is_active?: boolean
          auto_generate?: boolean
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          template_id?: string | null
          program_id?: string | null
          start_date?: string
          end_date?: string | null
          recurrence_pattern?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom'
          recurrence_interval?: number
          week_days?: number[] | null
          scheduled_time?: string | null
          reminder_minutes?: number | null
          is_active?: boolean
          auto_generate?: boolean
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      generated_workouts: {
        Row: {
          id: string
          scheduled_workout_id: string
          workout_session_id: string | null
          scheduled_date: string
          scheduled_time: string | null
          status: 'scheduled' | 'completed' | 'skipped' | 'rescheduled'
          skipped_reason: string | null
          generated_at: string
          completed_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          scheduled_workout_id: string
          workout_session_id?: string | null
          scheduled_date: string
          scheduled_time?: string | null
          status?: 'scheduled' | 'completed' | 'skipped' | 'rescheduled'
          skipped_reason?: string | null
          generated_at?: string
          completed_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          scheduled_workout_id?: string
          workout_session_id?: string | null
          scheduled_date?: string
          scheduled_time?: string | null
          status?: 'scheduled' | 'completed' | 'skipped' | 'rescheduled'
          skipped_reason?: string | null
          generated_at?: string
          completed_at?: string | null
          user_id?: string
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
