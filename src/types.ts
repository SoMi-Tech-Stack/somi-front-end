export type YearGroup = 'Reception' | 'Year 1' | 'Year 2' | 'Year 3' | 'Year 4' | 'Year 5' | 'Year 6';
export type EnergyLevel = 'Active' | 'Reflective';

export interface CreativeTask {
  type: 'visual' | 'movement' | 'writing';
  title: string;
  description: string;
  materials?: string[];
  duration?: string;
}

export interface NextStep {
  listeningPiece: {
    title: string;
    composer: string;
    reason: string;
  };
  activity: {
    type: 'performance' | 'composition';
    title: string;
    description: string;
    mmcStrand: string;
  };
}

export interface CurriculumEvidence {
  mmcStrands: string[];
  learningObjectives: string[];
  assessment: {
    type: string;
    criteria: string[];
  };
}

export interface WorksheetData {
  title: string;
  composer: string;
  qrCode: string;
  reason: string;
  questions: string[];
  reflectionPrompts: string[];
}

export interface SlidesData {
  title: string;
  composer: string;
  imageUrl?: string;
  listeningFocus: string[];
  questions: string[];
}

export interface ActivityResponse {
  piece: {
    title: string;
    composer: string;
    audioUrl?: string;
    trustedSource?: boolean;
    details?: {
      key?: string;
      timeSignature?: string;
      yearComposed?: string;
      duration?: string;
      license?: string;
      musicXmlUrl?: string;
      about?: string;
      sheetMusicUrl?: string;
      wikipediaUrl?: string;
    };
  };
  reason: string;
  questions: string[];
  teacherTip: string;
  creativeTasks: CreativeTask[];
  nextSteps: NextStep;
  curriculum: CurriculumEvidence;
  resources: {
    worksheet: WorksheetData;
    slides: SlidesData;
  };
}

export interface FormData {
  yearGroup: YearGroup;
  theme: string;
  energyLevel: EnergyLevel;
}