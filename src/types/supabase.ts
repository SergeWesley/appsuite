export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      books: {
        Row: {
          author: string
          cover: string | null
          cover_url: string | null
          created_at: string | null
          current_page: number | null
          date_added: string | null
          date_completed: string | null
          date_started: string | null
          genre: string | null
          id: string
          isbn: string | null
          notes: string | null
          progress: number | null
          rating: number | null
          status: string
          title: string
          total_pages: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          author: string
          cover?: string | null
          cover_url?: string | null
          created_at?: string | null
          current_page?: number | null
          date_added?: string | null
          date_completed?: string | null
          date_started?: string | null
          genre?: string | null
          id?: string
          isbn?: string | null
          notes?: string | null
          progress?: number | null
          rating?: number | null
          status: string
          title: string
          total_pages?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          author?: string
          cover?: string | null
          cover_url?: string | null
          created_at?: string | null
          current_page?: number | null
          date_added?: string | null
          date_completed?: string | null
          date_started?: string | null
          genre?: string | null
          id?: string
          isbn?: string | null
          notes?: string | null
          progress?: number | null
          rating?: number | null
          status?: string
          title?: string
          total_pages?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      browser_apps: {
        Row: {
          created_at: string | null
          icon_url: string | null
          id: string
          name: string
          order_index: number | null
          settings: Json
          updated_at: string | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          icon_url?: string | null
          id?: string
          name: string
          order_index?: number | null
          settings?: Json
          updated_at?: string | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          icon_url?: string | null
          id?: string
          name?: string
          order_index?: number | null
          settings?: Json
          updated_at?: string | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      cooker_recipe_cache: {
        Row: {
          created_at: string | null
          ingredients_hash: string
          ingredients_list: string[]
          recipes: Json
        }
        Insert: {
          created_at?: string | null
          ingredients_hash: string
          ingredients_list: string[]
          recipes: Json
        }
        Update: {
          created_at?: string | null
          ingredients_hash?: string
          ingredients_list?: string[]
          recipes?: Json
        }
        Relationships: []
      }
      exercises: {
        Row: {
          created_at: string | null
          description: string | null
          estimated_time_minutes: number | null
          id: string
          is_custom: boolean | null
          muscle_group: string
          name: string
          source: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          estimated_time_minutes?: number | null
          id?: string
          is_custom?: boolean | null
          muscle_group: string
          name: string
          source?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          estimated_time_minutes?: number | null
          id?: string
          is_custom?: boolean | null
          muscle_group?: string
          name?: string
          source?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      medias: {
        Row: {
          country: string | null
          created_at: string
          creator: string | null
          current_episode: number | null
          current_season: number | null
          date_added: string
          date_completed: string | null
          date_started: string | null
          director: string | null
          duration: number | null
          genre: string | null
          id: string
          imdb_id: string | null
          language: string | null
          notes: string | null
          original_title: string | null
          poster: string | null
          poster_url: string | null
          progress: number | null
          rating: number | null
          status: Database["public"]["Enums"]["media_status"]
          studio: string | null
          synopsis: string | null
          title: string
          tmdb_id: string | null
          total_episodes: number | null
          total_seasons: number | null
          type: Database["public"]["Enums"]["media_type"]
          updated_at: string
          user_id: string
          year: number | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          creator?: string | null
          current_episode?: number | null
          current_season?: number | null
          date_added?: string
          date_completed?: string | null
          date_started?: string | null
          director?: string | null
          duration?: number | null
          genre?: string | null
          id?: string
          imdb_id?: string | null
          language?: string | null
          notes?: string | null
          original_title?: string | null
          poster?: string | null
          poster_url?: string | null
          progress?: number | null
          rating?: number | null
          status?: Database["public"]["Enums"]["media_status"]
          studio?: string | null
          synopsis?: string | null
          title: string
          tmdb_id?: string | null
          total_episodes?: number | null
          total_seasons?: number | null
          type: Database["public"]["Enums"]["media_type"]
          updated_at?: string
          user_id: string
          year?: number | null
        }
        Update: {
          country?: string | null
          created_at?: string
          creator?: string | null
          current_episode?: number | null
          current_season?: number | null
          date_added?: string
          date_completed?: string | null
          date_started?: string | null
          director?: string | null
          duration?: number | null
          genre?: string | null
          id?: string
          imdb_id?: string | null
          language?: string | null
          notes?: string | null
          original_title?: string | null
          poster?: string | null
          poster_url?: string | null
          progress?: number | null
          rating?: number | null
          status?: Database["public"]["Enums"]["media_status"]
          studio?: string | null
          synopsis?: string | null
          title?: string
          tmdb_id?: string | null
          total_episodes?: number | null
          total_seasons?: number | null
          type?: Database["public"]["Enums"]["media_type"]
          updated_at?: string
          user_id?: string
          year?: number | null
        }
        Relationships: []
      }
      metrics: {
        Row: {
          id: number
          labels: Json | null
          metric_name: string
          timestamp: string
          value: number
        }
        Insert: {
          id?: number
          labels?: Json | null
          metric_name: string
          timestamp?: string
          value: number
        }
        Update: {
          id?: number
          labels?: Json | null
          metric_name?: string
          timestamp?: string
          value?: number
        }
        Relationships: []
      }
      note_folders: {
        Row: {
          color: string | null
          created_at: string
          custom_fields: Json | null
          id: string
          name: string
          order_index: number
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          custom_fields?: Json | null
          id?: string
          name: string
          order_index?: number
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          custom_fields?: Json | null
          id?: string
          name?: string
          order_index?: number
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "note_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      note_templates: {
        Row: {
          created_at: string
          fields: Json
          folder_id: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          fields?: Json
          folder_id: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          fields?: Json
          folder_id?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_templates_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "note_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          folder_id: string
          id: string
          metadata: Json | null
          template_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          folder_id: string
          id?: string
          metadata?: Json | null
          template_id?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          folder_id?: string
          id?: string
          metadata?: Json | null
          template_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "note_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "note_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_sessions: {
        Row: {
          book_id: string
          created_at: string | null
          duration: number | null
          end_time: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          pages_read: number | null
          start_time: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string | null
          duration?: number | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          pages_read?: number | null
          start_time?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string | null
          duration?: number | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          pages_read?: number | null
          start_time?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_sessions_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          app_link: string | null
          billing_date: number
          category: string
          color: string | null
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          amount: number
          app_link?: string | null
          billing_date: number
          category: string
          color?: string | null
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          amount?: number
          app_link?: string | null
          billing_date?: number
          category?: string
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          role: string | null
          user_id: string
        }
        Insert: {
          role?: string | null
          user_id: string
        }
        Update: {
          role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      watching_sessions: {
        Row: {
          created_at: string
          duration: number | null
          end_time: string | null
          episode_watched: number | null
          id: string
          is_active: boolean
          media_id: string
          notes: string | null
          season_watched: number | null
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          end_time?: string | null
          episode_watched?: number | null
          id?: string
          is_active?: boolean
          media_id: string
          notes?: string | null
          season_watched?: number | null
          start_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          end_time?: string | null
          episode_watched?: number | null
          id?: string
          is_active?: boolean
          media_id?: string
          notes?: string | null
          season_watched?: number | null
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watching_sessions_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercises: {
        Row: {
          created_at: string | null
          duration: number | null
          exercise_id: string
          exercise_order: number
          id: string
          notes: string | null
          reps: number | null
          sets: number | null
          slope: number | null
          speed: number | null
          weight: number | null
          workout_session_id: string
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          exercise_id: string
          exercise_order: number
          id?: string
          notes?: string | null
          reps?: number | null
          sets?: number | null
          slope?: number | null
          speed?: number | null
          weight?: number | null
          workout_session_id: string
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          exercise_id?: string
          exercise_order?: number
          id?: string
          notes?: string | null
          reps?: number | null
          sets?: number | null
          slope?: number | null
          speed?: number | null
          weight?: number | null
          workout_session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_session_id_fkey"
            columns: ["workout_session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          created_at: string | null
          date: string
          duration: number | null
          id: string
          notes: string | null
          total_exercises: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          duration?: number | null
          id?: string
          notes?: string | null
          total_exercises?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          duration?: number | null
          id?: string
          notes?: string | null
          total_exercises?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_metrics: { Args: never; Returns: undefined }
      cleanup_stale_sessions: { Args: never; Returns: number }
      get_active_session: {
        Args: { p_book_id: string; p_user_id: string }
        Returns: {
          current_duration: number
          session_id: string
          start_time: string
        }[]
      }
      get_user_active_sessions: {
        Args: { p_user_id: string }
        Returns: {
          book_id: string
          book_title: string
          current_duration: number
          session_id: string
          start_time: string
        }[]
      }
      start_reading_session: {
        Args: { p_book_id: string; p_user_id: string }
        Returns: string
      }
      stop_reading_session: {
        Args: {
          p_notes?: string
          p_pages_read?: number
          p_session_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      upsert_metric: {
        Args: {
          p_increment_value: number
          p_labels: Json
          p_metric_name: string
        }
        Returns: undefined
      }
    }
    Enums: {
      media_status:
        | "watching"
        | "completed"
        | "towatch"
        | "wishlist"
        | "dropped"
      media_type: "movie" | "series" | "anime" | "documentary" | "short"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      media_status: ["watching", "completed", "towatch", "wishlist", "dropped"],
      media_type: ["movie", "series", "anime", "documentary", "short"],
    },
  },
} as const
