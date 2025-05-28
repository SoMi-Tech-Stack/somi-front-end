/**
 * Database type definitions
 * 
 * This module contains TypeScript types for the database schema.
 * Update these types when modifying the database structure.
 * 
 * @module database/types
 */

export interface Score {
  id: string;
  title: string;
  composer: string;
  music_xml?: string;
  source?: 'musescore' | 'imslp' | 'openscore' | 'musicalion';
  metadata?: {
    key?: string;
    timeSignature?: string;
    yearComposed?: string;
    about?: string;
    sheetMusicUrl?: string;
    wikipediaUrl?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface LessonHistory {
  id: string;
  user_id: string;
  piece_id: string;
  year_group: string;
  theme: string;
  creative_tasks: any[];
  next_steps: Record<string, any>;
  curriculum_evidence: Record<string, any>;
  worksheet_data: Record<string, any>;
  slides_data: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface ActivityAnalytics {
  id: string;
  user_id?: string;
  activity_type?: 'listening' | 'lesson';
  input_data: Record<string, any>;
  output_data: Record<string, any>;
  feedback_rating?: number;
  feedback_text?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AnalyticsInsight {
  id: string;
  analysis: Record<string, any>;
  data_points: number;
  generated_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface Database {
  public: {
    Tables: {
      scores: {
        Row: Score;
        Insert: Omit<Score, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Score, 'id' | 'created_at' | 'updated_at'>>;
      };
      lesson_history: {
        Row: LessonHistory;
        Insert: Omit<LessonHistory, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<LessonHistory, 'id' | 'created_at' | 'updated_at'>>;
      };
      activity_analytics: {
        Row: ActivityAnalytics;
        Insert: Omit<ActivityAnalytics, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ActivityAnalytics, 'id' | 'created_at' | 'updated_at'>>;
      };
      analytics_insights: {
        Row: AnalyticsInsight;
        Insert: Omit<AnalyticsInsight, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AnalyticsInsight, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}