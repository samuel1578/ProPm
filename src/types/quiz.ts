// Quiz and Progress Type Definitions for PMP/CAPM Exam Preparation

export interface QuizQuestion {
    $id: string;
    questionText: string;
    options: string[]; // Array of 4 options (A, B, C, D)
    correctAnswer: string; // The correct option letter (A, B, C, or D)
    explanation: string;
    knowledgeArea: string; // e.g., "Project Integration Management"
    difficulty: 'easy' | 'medium' | 'hard';
    examType: 'PMP' | 'CAPM' | 'PMI-ACP' | 'PfMP';
    tags: string[];
    createdAt?: string;
}

export interface ShuffledQuestion extends QuizQuestion {
    shuffledOptions: string[];
    originalIndexMap: number[]; // Maps shuffled index to original index
}

export interface QuizAnswer {
    questionId: string;
    selectedAnswer: string; // The letter selected by user
    isCorrect: boolean;
    timeSpent?: number; // seconds spent on this question
}

export interface QuizAttempt {
    $id?: string;
    userId: string;
    enrollmentId: string;
    quizId: string;
    examType: string;
    mode: QuizMode;
    answers: QuizAnswer[];
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeSpent: number; // total time in seconds
    knowledgeAreaBreakdown: KnowledgeAreaScore[];
    completedAt: string;
    passed?: boolean;
}

export interface UserProgress {
    $id?: string;
    userId: string;
    enrollmentId: string;
    examType: string;
    totalQuestionsAttempted: number;
    correctAnswers: number;
    overallAccuracy: number; // percentage
    knowledgeAreaScores: KnowledgeAreaScore[];
    lastAttemptAt: string;
    strongAreas: string[];
    weakAreas: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface KnowledgeAreaScore {
    area: string;
    correct: number;
    total: number;
    accuracy: number; // percentage
}

export type QuizMode = 'practice' | 'timed-exam' | 'knowledge-area-focus' | 'final-exam';

export interface QuizSettings {
    mode: QuizMode;
    questionCount: number;
    knowledgeAreas: string[];
    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
    timed: boolean;
    timeLimit?: number; // in minutes
    showExplanations: boolean;
}

export interface QuizSession {
    settings: QuizSettings;
    questions: ShuffledQuestion[];
    answers: Map<string, QuizAnswer>;
    currentQuestionIndex: number;
    startTime: number;
    endTime?: number;
    isPaused: boolean;
}

// PMI Knowledge Areas for PMP
export const PMP_KNOWLEDGE_AREAS = [
    'Project Integration Management',
    'Project Scope Management',
    'Project Schedule Management',
    'Project Cost Management',
    'Project Quality Management',
    'Project Resource Management',
    'Project Communications Management',
    'Project Risk Management',
    'Project Procurement Management',
    'Project Stakeholder Management',
] as const;

// PMI Knowledge Areas for CAPM (same as PMP)
export const CAPM_KNOWLEDGE_AREAS = PMP_KNOWLEDGE_AREAS;

// Exam configurations
export const EXAM_CONFIGS = {
    PMP: {
        totalQuestions: 180,
        passingScore: 61, // percentage
        duration: 230, // minutes
        knowledgeAreas: PMP_KNOWLEDGE_AREAS,
    },
    CAPM: {
        totalQuestions: 150,
        passingScore: 61, // percentage
        duration: 180, // minutes
        knowledgeAreas: CAPM_KNOWLEDGE_AREAS,
    },
} as const;
