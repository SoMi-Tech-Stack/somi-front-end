export interface LessonPlan {
  year_group: string;
  topic: string;
  song_title: string;
  song_solfa: string[];
  song_rhythm: string[];
  teaching_framework: string;
  learning_objectives: string[];
  warmup_activities: string[];
  main_activities: string[];
  differentiation: {
    support: string;
    challenge: string;
  };
  assessment: {
    formative: string;
    summative: string;
  };
  notes: string;
}

export interface GeneratorResponse {
  message?: string;
  error?: string;
  plan?: LessonPlan;
}