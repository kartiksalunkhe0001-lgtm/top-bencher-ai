export type DocumentType = 'pdf' | 'text' | 'code' | 'ocr_handwritten';

export interface DocumentItem {
  id: string;
  name: string;
  type: DocumentType;
  size: string;
  sizeBytes?: number;
  subject: string;
  content: string;
  extractedOcrText?: string;
  imageUrl?: string;
  uploadDate: string;
  tags: string[];
}

export type OutputType = 'quiz' | 'flashcards' | 'mindmap' | 'charts';
export type QuizMode = 'mcq' | 'subjective' | 'mixed';
export type DifficultyLevel = 'fundamental' | 'competitive_exam' | 'olympiad_research';

export interface StudyConfig {
  outputType: OutputType;
  quizMode: QuizMode;
  quantity: number;
  difficulty: DifficultyLevel;
  focusSubject?: string;
}

export interface SolutionStep {
  stepNumber: number;
  title: string;
  formulaOrCode?: string;
  explanation: string;
  commonPitfall?: string;
}

export interface QuizQuestion {
  id: string;
  topic: string;
  subject: string;
  type: 'mcq' | 'subjective';
  question: string;
  options?: string[];
  correctOptionIndex?: number;
  distractorExplanations?: Record<number, { errorStep: number; pitfall: string }>;
  modelAnswer?: string;
  keyRubrics?: string[];
  solutionDerivation: SolutionStep[];
  conceptualCollapseWarning: string;
}

export interface QuizStepBreakdown {
  stepNumber: number;
  status: 'correct' | 'flawed' | 'unreached';
  critique: string;
}

export interface QuizSubmission {
  questionId: string;
  userSelection?: number;
  userTextAnswer?: string;
  isCorrect: boolean;
  diagnosedErrorStep?: number;
  diagnosedRationale?: string;
  stepBreakdown: QuizStepBreakdown[];
  timeSpentSeconds?: number;
}

export interface QuizSessionResult {
  topic: string;
  subject: string;
  total: number;
  correct: number;
  scorePercentage: number;
  status: RetentionCategory;
  totalDurationSeconds: number;
  questionTimes: Record<number, number>;
  submissions: Record<number, QuizSubmission>;
}

export interface Flashcard {
  id: string;
  topic: string;
  subject: string;
  front: string;
  back: string;
  mnemonic: string;
  formulaOrCode?: string;
  masteryLevel: number; // 0 to 5
  nextReviewDate: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  detail: string;
  formula?: string;
  keyTakeaway: string;
  children?: MindMapNode[];
}

export interface ChartRow {
  cells: string[];
  highlight?: boolean;
  tag?: string;
}

export interface StructuredChart {
  id: string;
  title: string;
  subtitle: string;
  type: 'comparison_matrix' | 'formula_cheat_sheet' | 'parameter_table' | 'algorithm_trace';
  headers: string[];
  rows: ChartRow[];
  notes: string;
}

export type RetentionCategory = 'HIGH_ATTENTION' | 'SOME_ATTENTION' | 'LOW_ATTENTION';

export interface SpacedInterval {
  day: number; // 1, 3, 7, 14
  dueDate: string;
  completed: boolean;
}

export interface TopicRetentionRecord {
  id: string;
  topic: string;
  subject: string;
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  status: RetentionCategory;
  intervals: SpacedInterval[];
  lastTestedAt: string;
  nextDueDay: number;
}

export interface FeynmanCritique {
  topic: string;
  userExplanation: string;
  overallScore: number; // 0 - 100
  clarityScore: number;
  simplicityScore: number;
  jargonPenaltyScore: number;
  identifiedJargons: string[];
  conceptualGaps: string[];
  misunderstandings: string[];
  childAnalogyGrade: string;
  eli5SimplifiedVersion: string;
  verdict: 'MASTERED' | 'DEVELOPING' | 'RE-EXPLAIN_REQUIRED';
}
