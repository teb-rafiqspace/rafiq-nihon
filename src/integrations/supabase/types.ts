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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      chapters: {
        Row: {
          chapter_number: number
          created_at: string
          description: string | null
          id: string
          is_free: boolean | null
          lesson_count: number | null
          sort_order: number
          title_id: string
          title_jp: string
          track: string
        }
        Insert: {
          chapter_number: number
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean | null
          lesson_count?: number | null
          sort_order: number
          title_id: string
          title_jp: string
          track: string
        }
        Update: {
          chapter_number?: number
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean | null
          lesson_count?: number | null
          sort_order?: number
          title_id?: string
          title_jp?: string
          track?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          feedback: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          feedback?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          feedback?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      kana_characters: {
        Row: {
          audio_url: string | null
          character: string
          created_at: string | null
          example_words: Json | null
          id: string
          is_basic: boolean | null
          memory_tip_id: string | null
          order_index: number
          romaji: string
          row_name: string | null
          stroke_order_svg: string | null
          type: string
        }
        Insert: {
          audio_url?: string | null
          character: string
          created_at?: string | null
          example_words?: Json | null
          id?: string
          is_basic?: boolean | null
          memory_tip_id?: string | null
          order_index?: number
          romaji: string
          row_name?: string | null
          stroke_order_svg?: string | null
          type: string
        }
        Update: {
          audio_url?: string | null
          character?: string
          created_at?: string | null
          example_words?: Json | null
          id?: string
          is_basic?: boolean | null
          memory_tip_id?: string | null
          order_index?: number
          romaji?: string
          row_name?: string | null
          stroke_order_svg?: string | null
          type?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          chapter_id: string
          content: Json | null
          created_at: string
          id: string
          lesson_number: number
          sort_order: number
          title_id: string
          title_jp: string
          xp_reward: number | null
        }
        Insert: {
          chapter_id: string
          content?: Json | null
          created_at?: string
          id?: string
          lesson_number: number
          sort_order: number
          title_id: string
          title_jp: string
          xp_reward?: number | null
        }
        Update: {
          chapter_id?: string
          content?: Json | null
          created_at?: string
          id?: string
          lesson_number?: number
          sort_order?: number
          title_id?: string
          title_jp?: string
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      mock_test_questions: {
        Row: {
          correct_answer: string
          created_at: string
          explanation: string | null
          id: string
          options: Json
          question_text: string
          section: string
          sort_order: number
          test_type: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json
          question_text: string
          section: string
          sort_order?: number
          test_type: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json
          question_text?: string
          section?: string
          sort_order?: number
          test_type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_level: number | null
          current_streak: number | null
          daily_goal_minutes: number | null
          full_name: string | null
          id: string
          last_active_at: string | null
          learning_goal: string | null
          lessons_completed: number | null
          longest_streak: number | null
          onboarding_completed: boolean | null
          skill_level: string | null
          total_xp: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_level?: number | null
          current_streak?: number | null
          daily_goal_minutes?: number | null
          full_name?: string | null
          id?: string
          last_active_at?: string | null
          learning_goal?: string | null
          lessons_completed?: number | null
          longest_streak?: number | null
          onboarding_completed?: boolean | null
          skill_level?: string | null
          total_xp?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_level?: number | null
          current_streak?: number | null
          daily_goal_minutes?: number | null
          full_name?: string | null
          id?: string
          last_active_at?: string | null
          learning_goal?: string | null
          lessons_completed?: number | null
          longest_streak?: number | null
          onboarding_completed?: boolean | null
          skill_level?: string | null
          total_xp?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string
          explanation: string | null
          id: string
          lesson_id: string | null
          options: Json | null
          question_text: string
          question_type: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          explanation?: string | null
          id?: string
          lesson_id?: string | null
          options?: Json | null
          question_text: string
          question_type: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          explanation?: string | null
          id?: string
          lesson_id?: string | null
          options?: Json | null
          question_text?: string
          question_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          chats_remaining: number | null
          created_at: string
          expires_at: string | null
          id: string
          plan_type: string
          started_at: string
          status: string
          trial_used: boolean
          user_id: string
        }
        Insert: {
          chats_remaining?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_type?: string
          started_at?: string
          status?: string
          trial_used?: boolean
          user_id: string
        }
        Update: {
          chats_remaining?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_type?: string
          started_at?: string
          status?: string
          trial_used?: boolean
          user_id?: string
        }
        Relationships: []
      }
      test_attempts: {
        Row: {
          answers: Json | null
          chapter_id: string | null
          completed_at: string
          id: string
          passed: boolean | null
          score: number
          test_type: string
          time_spent_seconds: number | null
          total_questions: number
          user_id: string
        }
        Insert: {
          answers?: Json | null
          chapter_id?: string | null
          completed_at?: string
          id?: string
          passed?: boolean | null
          score: number
          test_type: string
          time_spent_seconds?: number | null
          total_questions: number
          user_id: string
        }
        Update: {
          answers?: Json | null
          chapter_id?: string | null
          completed_at?: string
          id?: string
          passed?: boolean | null
          score?: number
          test_type?: string
          time_spent_seconds?: number | null
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_attempts_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      time_vocabulary: {
        Row: {
          created_at: string
          exception_note: string | null
          id: string
          is_exception: boolean | null
          japanese: string
          meaning_id: string
          order_index: number
          reading: string
          type: string
        }
        Insert: {
          created_at?: string
          exception_note?: string | null
          id: string
          is_exception?: boolean | null
          japanese: string
          meaning_id: string
          order_index?: number
          reading: string
          type: string
        }
        Update: {
          created_at?: string
          exception_note?: string | null
          id?: string
          is_exception?: boolean | null
          japanese?: string
          meaning_id?: string
          order_index?: number
          reading?: string
          type?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_kana_progress: {
        Row: {
          correct_count: number | null
          created_at: string | null
          id: string
          incorrect_count: number | null
          kana_id: string
          last_reviewed_at: string | null
          next_review_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          correct_count?: number | null
          created_at?: string | null
          id?: string
          incorrect_count?: number | null
          kana_id: string
          last_reviewed_at?: string | null
          next_review_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          correct_count?: number | null
          created_at?: string | null
          id?: string
          incorrect_count?: number | null
          kana_id?: string
          last_reviewed_at?: string | null
          next_review_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_kana_progress_kana_id_fkey"
            columns: ["kana_id"]
            isOneToOne: false
            referencedRelation: "kana_characters"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          chapter_id: string | null
          completed: boolean | null
          completed_at: string | null
          created_at: string
          id: string
          lesson_id: string | null
          progress_percent: number | null
          updated_at: string
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          chapter_id?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          progress_percent?: number | null
          updated_at?: string
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          chapter_id?: string | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          progress_percent?: number | null
          updated_at?: string
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      vocabulary: {
        Row: {
          audio_url: string | null
          category: string | null
          created_at: string
          example_id: string | null
          example_jp: string | null
          id: string
          jlpt_level: string | null
          lesson_id: string | null
          meaning_id: string
          reading: string | null
          word_jp: string
        }
        Insert: {
          audio_url?: string | null
          category?: string | null
          created_at?: string
          example_id?: string | null
          example_jp?: string | null
          id?: string
          jlpt_level?: string | null
          lesson_id?: string | null
          meaning_id: string
          reading?: string | null
          word_jp: string
        }
        Update: {
          audio_url?: string | null
          category?: string | null
          created_at?: string
          example_id?: string | null
          example_jp?: string | null
          id?: string
          jlpt_level?: string | null
          lesson_id?: string | null
          meaning_id?: string
          reading?: string | null
          word_jp?: string
        }
        Relationships: [
          {
            foreignKeyName: "vocabulary_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const
