/**
 * @fileoverview Type definitions for the AI lesson planner module
 * NOTE: This module is not active in the MVP version and is reserved for future development
 */

export interface LessonPlanInput {
  year_group: string;
  topic: string;
  keywords?: string[];
  piece?: string;
  provider?: 'gemini' | 'openai' | 'huggingface' | 'dataset';
}

export interface TeachingAid {
  type: 'solfaPiano' | 'rhythmCards' | 'glossary' | 'assessmentRubric';
  title: string;
  description: string;
  data: Record<string, any>;
}

export interface SolfaColor {
  note: string;
  color: string;
  label: string;
}

export const SOLFA_COLORS: SolfaColor[] = [
  { note: 'do', color: '#4CAF50', label: 'green' },
  { note: 're', color: '#795548', label: 'brown' },
  { note: 'mi', color: '#2196F3', label: 'blue' },
  { note: 'fa', color: '#FF9800', label: 'orange' },
  { note: 'so', color: '#F44336', label: 'red' },
  { note: 'la', color: '#FFEB3B', label: 'yellow' },
  { note: 'ti', color: '#E91E63', label: 'pink' }
];

export interface ActivityStep {
  duration: string;
  description: string;
  resources?: string[];
  teacherNotes?: string;
}

export interface LessonPlanOutput {
  title: string;
  objectives: string[];
  warmUp: ActivityStep;
  mainActivities: ActivityStep[];
  plenary: ActivityStep;
  assessment: string[];
  differentiation: {
    support: string[];
    extension: string[];
  };
  resources: string[];
  nextSteps: string;
}

export interface ListeningActivity {
  piece: {
    title: string;
    composer: string;
    youtubeLink: string;
    details?: {
      key?: string;
      timeSignature?: string;
      yearComposed?: string;
      about?: string;
    };
  };
  reason: string;
  questions: string[];
  teacherTip: string;
  error?: string;
}

export interface GeneratorResponse {
}