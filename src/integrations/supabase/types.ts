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
      conversation_lines: {
        Row: {
          acceptable_responses: string[] | null
          ai_response_variations: Json | null
          audio_url: string | null
          created_at: string | null
          id: string
          is_user_turn: boolean | null
          japanese_text: string
          line_order: number
          meaning_id: string
          reading_hiragana: string | null
          response_hints: string[] | null
          script_id: string | null
          speaker: string
          speaker_role: string | null
        }
        Insert: {
          acceptable_responses?: string[] | null
          ai_response_variations?: Json | null
          audio_url?: string | null
          created_at?: string | null
          id: string
          is_user_turn?: boolean | null
          japanese_text: string
          line_order: number
          meaning_id: string
          reading_hiragana?: string | null
          response_hints?: string[] | null
          script_id?: string | null
          speaker: string
          speaker_role?: string | null
        }
        Update: {
          acceptable_responses?: string[] | null
          ai_response_variations?: Json | null
          audio_url?: string | null
          created_at?: string | null
          id?: string
          is_user_turn?: boolean | null
          japanese_text?: string
          line_order?: number
          meaning_id?: string
          reading_hiragana?: string | null
          response_hints?: string[] | null
          script_id?: string | null
          speaker?: string
          speaker_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_lines_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "conversation_scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_scripts: {
        Row: {
          created_at: string | null
          difficulty: string | null
          estimated_turns: number | null
          id: string
          lesson_id: string | null
          location: string | null
          participants: string[] | null
          scenario_description: string | null
          title_id: string
          title_ja: string
        }
        Insert: {
          created_at?: string | null
          difficulty?: string | null
          estimated_turns?: number | null
          id: string
          lesson_id?: string | null
          location?: string | null
          participants?: string[] | null
          scenario_description?: string | null
          title_id: string
          title_ja: string
        }
        Update: {
          created_at?: string | null
          difficulty?: string | null
          estimated_turns?: number | null
          id?: string
          lesson_id?: string | null
          location?: string | null
          participants?: string[] | null
          scenario_description?: string | null
          title_id?: string
          title_ja?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_scripts_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "speaking_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_challenges: {
        Row: {
          bonus_xp: number | null
          challenge_date: string
          created_at: string | null
          id: string
          quiz_set_ids: string[] | null
        }
        Insert: {
          bonus_xp?: number | null
          challenge_date: string
          created_at?: string | null
          id?: string
          quiz_set_ids?: string[] | null
        }
        Update: {
          bonus_xp?: number | null
          challenge_date?: string
          created_at?: string | null
          id?: string
          quiz_set_ids?: string[] | null
        }
        Relationships: []
      }
      flashcard_cards: {
        Row: {
          audio_url: string | null
          back_example: string | null
          back_reading: string | null
          back_subtext: string | null
          back_text: string
          created_at: string | null
          deck_id: string | null
          difficulty: number | null
          front_image_url: string | null
          front_subtext: string | null
          front_text: string
          id: string
          order_index: number | null
          tags: string[] | null
        }
        Insert: {
          audio_url?: string | null
          back_example?: string | null
          back_reading?: string | null
          back_subtext?: string | null
          back_text: string
          created_at?: string | null
          deck_id?: string | null
          difficulty?: number | null
          front_image_url?: string | null
          front_subtext?: string | null
          front_text: string
          id: string
          order_index?: number | null
          tags?: string[] | null
        }
        Update: {
          audio_url?: string | null
          back_example?: string | null
          back_reading?: string | null
          back_subtext?: string | null
          back_text?: string
          created_at?: string | null
          deck_id?: string | null
          difficulty?: number | null
          front_image_url?: string | null
          front_subtext?: string | null
          front_text?: string
          id?: string
          order_index?: number | null
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_cards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "flashcard_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcard_decks: {
        Row: {
          card_count: number | null
          category: string
          color: string | null
          created_at: string | null
          description: string | null
          icon_name: string | null
          id: string
          is_premium: boolean | null
          order_index: number | null
          title_id: string
          title_jp: string
          track: string | null
        }
        Insert: {
          card_count?: number | null
          category: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id: string
          is_premium?: boolean | null
          order_index?: number | null
          title_id: string
          title_jp: string
          track?: string | null
        }
        Update: {
          card_count?: number | null
          category?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          is_premium?: boolean | null
          order_index?: number | null
          title_id?: string
          title_jp?: string
          track?: string | null
        }
        Relationships: []
      }
      flashcard_sessions: {
        Row: {
          cards_correct: number | null
          cards_incorrect: number | null
          cards_studied: number | null
          completed_at: string | null
          deck_id: string | null
          id: string
          started_at: string | null
          time_spent_seconds: number | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          cards_correct?: number | null
          cards_incorrect?: number | null
          cards_studied?: number | null
          completed_at?: string | null
          deck_id?: string | null
          id?: string
          started_at?: string | null
          time_spent_seconds?: number | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          cards_correct?: number | null
          cards_incorrect?: number | null
          cards_studied?: number | null
          completed_at?: string | null
          deck_id?: string | null
          id?: string
          started_at?: string | null
          time_spent_seconds?: number | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_sessions_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "flashcard_decks"
            referencedColumns: ["id"]
          },
        ]
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
      practice_quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string | null
          difficulty: number | null
          explanation: string | null
          hint: string | null
          id: string
          options: Json | null
          order_index: number | null
          question_audio_url: string | null
          question_image_url: string | null
          question_text: string
          question_type: string
          quiz_set_id: string | null
          tags: string[] | null
        }
        Insert: {
          correct_answer: string
          created_at?: string | null
          difficulty?: number | null
          explanation?: string | null
          hint?: string | null
          id: string
          options?: Json | null
          order_index?: number | null
          question_audio_url?: string | null
          question_image_url?: string | null
          question_text: string
          question_type: string
          quiz_set_id?: string | null
          tags?: string[] | null
        }
        Update: {
          correct_answer?: string
          created_at?: string | null
          difficulty?: number | null
          explanation?: string | null
          hint?: string | null
          id?: string
          options?: Json | null
          order_index?: number | null
          question_audio_url?: string | null
          question_image_url?: string | null
          question_text?: string
          question_type?: string
          quiz_set_id?: string | null
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_quiz_questions_quiz_set_id_fkey"
            columns: ["quiz_set_id"]
            isOneToOne: false
            referencedRelation: "practice_quiz_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_quiz_sets: {
        Row: {
          category: string
          color: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          icon_name: string | null
          id: string
          is_daily: boolean | null
          is_premium: boolean | null
          order_index: number | null
          question_count: number | null
          subcategory: string | null
          time_limit_seconds: number | null
          title_id: string
          title_jp: string
          track: string | null
          xp_reward: number | null
        }
        Insert: {
          category: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          icon_name?: string | null
          id: string
          is_daily?: boolean | null
          is_premium?: boolean | null
          order_index?: number | null
          question_count?: number | null
          subcategory?: string | null
          time_limit_seconds?: number | null
          title_id: string
          title_jp: string
          track?: string | null
          xp_reward?: number | null
        }
        Update: {
          category?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          icon_name?: string | null
          id?: string
          is_daily?: boolean | null
          is_premium?: boolean | null
          order_index?: number | null
          question_count?: number | null
          subcategory?: string | null
          time_limit_seconds?: number | null
          title_id?: string
          title_jp?: string
          track?: string | null
          xp_reward?: number | null
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
      roleplay_scenarios: {
        Row: {
          ai_role: string
          created_at: string | null
          difficulty: string | null
          estimated_minutes: number | null
          id: string
          key_phrases: string[] | null
          lesson_id: string | null
          location: string | null
          objectives: string[] | null
          scenario_description_id: string | null
          scenario_description_ja: string | null
          situation: string | null
          title_id: string
          title_ja: string
          user_role: string
        }
        Insert: {
          ai_role: string
          created_at?: string | null
          difficulty?: string | null
          estimated_minutes?: number | null
          id: string
          key_phrases?: string[] | null
          lesson_id?: string | null
          location?: string | null
          objectives?: string[] | null
          scenario_description_id?: string | null
          scenario_description_ja?: string | null
          situation?: string | null
          title_id: string
          title_ja: string
          user_role: string
        }
        Update: {
          ai_role?: string
          created_at?: string | null
          difficulty?: string | null
          estimated_minutes?: number | null
          id?: string
          key_phrases?: string[] | null
          lesson_id?: string | null
          location?: string | null
          objectives?: string[] | null
          scenario_description_id?: string | null
          scenario_description_ja?: string | null
          situation?: string | null
          title_id?: string
          title_ja?: string
          user_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "roleplay_scenarios_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "speaking_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      speaking_items: {
        Row: {
          audio_duration_ms: number | null
          audio_slow_url: string | null
          audio_url: string | null
          common_mistakes: string | null
          context_situation: string | null
          created_at: string | null
          formality_level: string | null
          id: string
          japanese_text: string
          lesson_id: string | null
          meaning_en: string | null
          meaning_id: string
          order_index: number | null
          pitch_pattern: string | null
          pitch_visual: string | null
          pronunciation_tips: string | null
          reading_hiragana: string | null
          reading_romaji: string | null
          speaker_gender: string | null
        }
        Insert: {
          audio_duration_ms?: number | null
          audio_slow_url?: string | null
          audio_url?: string | null
          common_mistakes?: string | null
          context_situation?: string | null
          created_at?: string | null
          formality_level?: string | null
          id: string
          japanese_text: string
          lesson_id?: string | null
          meaning_en?: string | null
          meaning_id: string
          order_index?: number | null
          pitch_pattern?: string | null
          pitch_visual?: string | null
          pronunciation_tips?: string | null
          reading_hiragana?: string | null
          reading_romaji?: string | null
          speaker_gender?: string | null
        }
        Update: {
          audio_duration_ms?: number | null
          audio_slow_url?: string | null
          audio_url?: string | null
          common_mistakes?: string | null
          context_situation?: string | null
          created_at?: string | null
          formality_level?: string | null
          id?: string
          japanese_text?: string
          lesson_id?: string | null
          meaning_en?: string | null
          meaning_id?: string
          order_index?: number | null
          pitch_pattern?: string | null
          pitch_visual?: string | null
          pronunciation_tips?: string | null
          reading_hiragana?: string | null
          reading_romaji?: string | null
          speaker_gender?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "speaking_items_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "speaking_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      speaking_lessons: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          estimated_minutes: number | null
          id: string
          is_premium: boolean | null
          lesson_type: string
          order_index: number | null
          title_id: string
          title_ja: string
          track: string | null
          xp_reward: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_minutes?: number | null
          id: string
          is_premium?: boolean | null
          lesson_type: string
          order_index?: number | null
          title_id: string
          title_ja: string
          track?: string | null
          xp_reward?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_minutes?: number | null
          id?: string
          is_premium?: boolean | null
          lesson_type?: string
          order_index?: number | null
          title_id?: string
          title_ja?: string
          track?: string | null
          xp_reward?: number | null
        }
        Relationships: []
      }
      speaking_sessions: {
        Row: {
          average_score: number | null
          completed_at: string | null
          duration_seconds: number | null
          id: string
          items_practiced: number | null
          lesson_id: string | null
          session_type: string
          started_at: string | null
          total_items: number | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          average_score?: number | null
          completed_at?: string | null
          duration_seconds?: number | null
          id?: string
          items_practiced?: number | null
          lesson_id?: string | null
          session_type: string
          started_at?: string | null
          total_items?: number | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          average_score?: number | null
          completed_at?: string | null
          duration_seconds?: number | null
          id?: string
          items_practiced?: number | null
          lesson_id?: string | null
          session_type?: string
          started_at?: string | null
          total_items?: number | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "speaking_sessions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "speaking_lessons"
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
      test_institutions: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          institution_type: string
          is_jft_basic: boolean | null
          is_jlpt_official: boolean | null
          is_nat_test: boolean | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name_en: string | null
          name_id: string
          name_ja: string
          phone: string | null
          province: string | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id: string
          institution_type: string
          is_jft_basic?: boolean | null
          is_jlpt_official?: boolean | null
          is_nat_test?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name_en?: string | null
          name_id: string
          name_ja: string
          phone?: string | null
          province?: string | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          institution_type?: string
          is_jft_basic?: boolean | null
          is_jlpt_official?: boolean | null
          is_nat_test?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name_en?: string | null
          name_id?: string
          name_ja?: string
          phone?: string | null
          province?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      test_schedules: {
        Row: {
          allow_in_app_registration: boolean | null
          announcement_date: string | null
          capacity_per_level: Json | null
          created_at: string | null
          current_registrations: Json | null
          external_registration_url: string | null
          fee_amount: number | null
          fee_currency: string | null
          id: string
          institution_id: string | null
          levels_available: string[] | null
          notes: string | null
          payment_deadline: string | null
          payment_methods: string[] | null
          registration_end: string
          registration_start: string
          requirements: string[] | null
          status: string | null
          test_date: string
          test_name: string
          test_time_end: string | null
          test_time_start: string | null
          test_type_id: string | null
          updated_at: string | null
          venue_address: string | null
          venue_city: string | null
          venue_name: string | null
        }
        Insert: {
          allow_in_app_registration?: boolean | null
          announcement_date?: string | null
          capacity_per_level?: Json | null
          created_at?: string | null
          current_registrations?: Json | null
          external_registration_url?: string | null
          fee_amount?: number | null
          fee_currency?: string | null
          id: string
          institution_id?: string | null
          levels_available?: string[] | null
          notes?: string | null
          payment_deadline?: string | null
          payment_methods?: string[] | null
          registration_end: string
          registration_start: string
          requirements?: string[] | null
          status?: string | null
          test_date: string
          test_name: string
          test_time_end?: string | null
          test_time_start?: string | null
          test_type_id?: string | null
          updated_at?: string | null
          venue_address?: string | null
          venue_city?: string | null
          venue_name?: string | null
        }
        Update: {
          allow_in_app_registration?: boolean | null
          announcement_date?: string | null
          capacity_per_level?: Json | null
          created_at?: string | null
          current_registrations?: Json | null
          external_registration_url?: string | null
          fee_amount?: number | null
          fee_currency?: string | null
          id?: string
          institution_id?: string | null
          levels_available?: string[] | null
          notes?: string | null
          payment_deadline?: string | null
          payment_methods?: string[] | null
          registration_end?: string
          registration_start?: string
          requirements?: string[] | null
          status?: string | null
          test_date?: string
          test_name?: string
          test_time_end?: string | null
          test_time_start?: string | null
          test_type_id?: string | null
          updated_at?: string | null
          venue_address?: string | null
          venue_city?: string | null
          venue_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_schedules_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "test_institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_schedules_test_type_id_fkey"
            columns: ["test_type_id"]
            isOneToOne: false
            referencedRelation: "test_types"
            referencedColumns: ["id"]
          },
        ]
      }
      test_types: {
        Row: {
          color: string | null
          description: string | null
          icon_name: string | null
          id: string
          levels: string[] | null
          name_en: string | null
          name_id: string
          name_ja: string
          official_website: string | null
          passing_criteria: Json | null
          recognition: string | null
          test_sections: Json | null
          validity_years: number | null
        }
        Insert: {
          color?: string | null
          description?: string | null
          icon_name?: string | null
          id: string
          levels?: string[] | null
          name_en?: string | null
          name_id: string
          name_ja: string
          official_website?: string | null
          passing_criteria?: Json | null
          recognition?: string | null
          test_sections?: Json | null
          validity_years?: number | null
        }
        Update: {
          color?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          levels?: string[] | null
          name_en?: string | null
          name_id?: string
          name_ja?: string
          official_website?: string | null
          passing_criteria?: Json | null
          recognition?: string | null
          test_sections?: Json | null
          validity_years?: number | null
        }
        Relationships: []
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
      user_daily_progress: {
        Row: {
          challenge_date: string
          completed: boolean | null
          completed_at: string | null
          id: string
          score: number | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          challenge_date: string
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          score?: number | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          challenge_date?: string
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          score?: number | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: []
      }
      user_flashcard_progress: {
        Row: {
          card_id: string | null
          correct_count: number | null
          created_at: string | null
          deck_id: string | null
          ease_factor: number | null
          id: string
          incorrect_count: number | null
          interval_days: number | null
          last_reviewed_at: string | null
          next_review_at: string | null
          repetitions: number | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          card_id?: string | null
          correct_count?: number | null
          created_at?: string | null
          deck_id?: string | null
          ease_factor?: number | null
          id?: string
          incorrect_count?: number | null
          interval_days?: number | null
          last_reviewed_at?: string | null
          next_review_at?: string | null
          repetitions?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          card_id?: string | null
          correct_count?: number | null
          created_at?: string | null
          deck_id?: string | null
          ease_factor?: number | null
          id?: string
          incorrect_count?: number | null
          interval_days?: number | null
          last_reviewed_at?: string | null
          next_review_at?: string | null
          repetitions?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_flashcard_progress_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "flashcard_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_flashcard_progress_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "flashcard_decks"
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
      user_practice_history: {
        Row: {
          answers: Json | null
          completed_at: string | null
          id: string
          quiz_set_id: string | null
          score: number
          time_spent_seconds: number | null
          total_questions: number
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          answers?: Json | null
          completed_at?: string | null
          id?: string
          quiz_set_id?: string | null
          score: number
          time_spent_seconds?: number | null
          total_questions: number
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          answers?: Json | null
          completed_at?: string | null
          id?: string
          quiz_set_id?: string | null
          score?: number
          time_spent_seconds?: number | null
          total_questions?: number
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_practice_history_quiz_set_id_fkey"
            columns: ["quiz_set_id"]
            isOneToOne: false
            referencedRelation: "practice_quiz_sets"
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
      user_recordings: {
        Row: {
          accuracy_score: number | null
          created_at: string | null
          duration_ms: number | null
          feedback_text: string | null
          fluency_score: number | null
          id: string
          item_id: string | null
          overall_score: number | null
          problem_areas: Json | null
          pronunciation_score: number | null
          recording_url: string | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          accuracy_score?: number | null
          created_at?: string | null
          duration_ms?: number | null
          feedback_text?: string | null
          fluency_score?: number | null
          id?: string
          item_id?: string | null
          overall_score?: number | null
          problem_areas?: Json | null
          pronunciation_score?: number | null
          recording_url?: string | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          accuracy_score?: number | null
          created_at?: string | null
          duration_ms?: number | null
          feedback_text?: string | null
          fluency_score?: number | null
          id?: string
          item_id?: string | null
          overall_score?: number | null
          problem_areas?: Json | null
          pronunciation_score?: number | null
          recording_url?: string | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_recordings_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "speaking_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_recordings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "speaking_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_saved_tests: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          reminder_date: string | null
          reminder_set: boolean | null
          schedule_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          reminder_date?: string | null
          reminder_set?: boolean | null
          schedule_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          reminder_date?: string | null
          reminder_set?: boolean | null
          schedule_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_saved_tests_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "test_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_speaking_progress: {
        Row: {
          attempts: number | null
          average_score: number | null
          best_score: number | null
          created_at: string | null
          id: string
          item_id: string | null
          last_practiced_at: string | null
          mastered: boolean | null
          mastered_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attempts?: number | null
          average_score?: number | null
          best_score?: number | null
          created_at?: string | null
          id?: string
          item_id?: string | null
          last_practiced_at?: string | null
          mastered?: boolean | null
          mastered_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attempts?: number | null
          average_score?: number | null
          best_score?: number | null
          created_at?: string | null
          id?: string
          item_id?: string | null
          last_practiced_at?: string | null
          mastered?: boolean | null
          mastered_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_speaking_progress_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "speaking_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_test_registrations: {
        Row: {
          address: string | null
          birth_date: string | null
          city: string | null
          confirmed_at: string | null
          created_at: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          exam_number: string | null
          exam_room: string | null
          full_name: string
          full_name_katakana: string | null
          gender: string | null
          id: string
          id_card_number: string | null
          id_document_url: string | null
          nationality: string | null
          passport_number: string | null
          payment_amount: number | null
          payment_date: string | null
          payment_method: string | null
          payment_proof_url: string | null
          payment_status: string | null
          phone: string
          photo_url: string | null
          postal_code: string | null
          registration_status: string | null
          schedule_id: string | null
          seat_number: string | null
          submitted_at: string | null
          test_level: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          city?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          exam_number?: string | null
          exam_room?: string | null
          full_name: string
          full_name_katakana?: string | null
          gender?: string | null
          id?: string
          id_card_number?: string | null
          id_document_url?: string | null
          nationality?: string | null
          passport_number?: string | null
          payment_amount?: number | null
          payment_date?: string | null
          payment_method?: string | null
          payment_proof_url?: string | null
          payment_status?: string | null
          phone: string
          photo_url?: string | null
          postal_code?: string | null
          registration_status?: string | null
          schedule_id?: string | null
          seat_number?: string | null
          submitted_at?: string | null
          test_level: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          city?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          exam_number?: string | null
          exam_room?: string | null
          full_name?: string
          full_name_katakana?: string | null
          gender?: string | null
          id?: string
          id_card_number?: string | null
          id_document_url?: string | null
          nationality?: string | null
          passport_number?: string | null
          payment_amount?: number | null
          payment_date?: string | null
          payment_method?: string | null
          payment_proof_url?: string | null
          payment_status?: string | null
          phone?: string
          photo_url?: string | null
          postal_code?: string | null
          registration_status?: string | null
          schedule_id?: string | null
          seat_number?: string | null
          submitted_at?: string | null
          test_level?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_test_registrations_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "test_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_test_results: {
        Row: {
          certificate_expiry_date: string | null
          certificate_issued_date: string | null
          certificate_number: string | null
          certificate_url: string | null
          created_at: string | null
          id: string
          is_passed: boolean | null
          passing_score: number | null
          registration_id: string | null
          section_scores: Json | null
          test_date: string
          test_level: string
          test_type_id: string | null
          total_score: number | null
          user_id: string
        }
        Insert: {
          certificate_expiry_date?: string | null
          certificate_issued_date?: string | null
          certificate_number?: string | null
          certificate_url?: string | null
          created_at?: string | null
          id?: string
          is_passed?: boolean | null
          passing_score?: number | null
          registration_id?: string | null
          section_scores?: Json | null
          test_date: string
          test_level: string
          test_type_id?: string | null
          total_score?: number | null
          user_id: string
        }
        Update: {
          certificate_expiry_date?: string | null
          certificate_issued_date?: string | null
          certificate_number?: string | null
          certificate_url?: string | null
          created_at?: string | null
          id?: string
          is_passed?: boolean | null
          passing_score?: number | null
          registration_id?: string | null
          section_scores?: Json | null
          test_date?: string
          test_level?: string
          test_type_id?: string | null
          total_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_test_results_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "user_test_registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_test_results_test_type_id_fkey"
            columns: ["test_type_id"]
            isOneToOne: false
            referencedRelation: "test_types"
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
