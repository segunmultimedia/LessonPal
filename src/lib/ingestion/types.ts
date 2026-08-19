export interface CurriculumSourceInfo {
  classLevel: string;
  subject: string;
  sourceType: string;
  versionYear: string;
  pdfPath?: string;
  textContent?: string; // Pre-extracted text
  timeAllocation?: {
    recommendedPeriodsPerWeek: number;
    periodDurationMinutes: number;
    weeksPerTerm?: number;
    termsPerYear?: number;
  };
}

export interface ParsedIndicator {
  code: string;
  strandNum: number;
  subStrandNum: number;
  contentStdNum: number;
  indicatorNum: number;
  description: string;
  exemplars: string;
  strandName?: string;
  subStrandName?: string;
  contentStandardName?: string;
}

export interface ValidationReport {
  classLevel: string;
  subject: string;
  source: string;
  strands: number;
  subStrands: number;
  contentStandards: number;
  indicators: number;
  duplicates: number;
  malformedIndicators: number;
  outsideClassIndicators: number;
  missingDescriptions: number;
  isSafeToContinue: boolean;
}

export interface SequencedSession {
  term: number;
  week: number;
  lessonNumber: number;
  indicatorCode: string;
  description?: string;
  isRecurring?: boolean;
  sequenceStatus?: string;
}

export interface TeachingSupport {
  indicatorCode: string;
  term: number;
  week: number;
  lessonNumber: number;
  sequenceStatus: string;
  topic: string;
  learningObjective: string;
  whatToTeach: string;
  howToTeach: string;
  activities: string;
  resources: string;
  durationMinutes: number;
  exercises: {
    title: string;
    sortOrder: number;
    questions: { question: string; answer: string; sortOrder: number }[];
  }[];
}
