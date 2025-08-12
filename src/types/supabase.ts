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
          status: 'reading' | 'completed' | 'toread'
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
          status: 'reading' | 'completed' | 'toread'
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
          status?: 'reading' | 'completed' | 'toread'
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
