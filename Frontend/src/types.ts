export type WorkflowStepId =
  | 'create'
  | 'knowledge'
  | 'builder'
  | 'review'
  | 'publish'
  | 'students'
  | 'analytics'
  | 'improve';

export type StepStatus = 'completed' | 'in_progress' | 'pending' | 'needs_attention';

export interface WorkflowStep {
  id: WorkflowStepId;
  label: string;
  status: StepStatus;
  completionPercentage: number;
}

export interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  institution: string;
  avatarUrl?: string;
}

export interface Course {
  id: string;
  title: string;
  code: string;
  subject: string;
  department: string;
  semester: string;
  description: string;
  learningObjectives: string[];
  workflowStatus: Record<WorkflowStepId, StepStatus>;
  overallProgress: number;
  studentsCount: number;
  contentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeDocument {
  id: string;
  courseId: string;
  fileName: string;
  fileSize: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'ppt';
  category: 'Syllabus' | 'Notes' | 'Books' | 'Question Papers' | 'Reference Materials';
  status: 'uploaded' | 'processing' | 'processed' | 'error';
  chunkCount?: number;
  unitCount?: number;
  topicCount?: number;
  uploadedAt: string;
}

export interface Topic {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  contentsCount: number;
  averageScore?: number;
  status: 'not_generated' | 'generating' | 'generated' | 'reviewed' | 'published';
}

export interface Unit {
  id: string;
  courseId: string;
  unitNumber: number;
  title: string;
  topics: Topic[];
}

export type ContentType =
  | 'lecture_notes'
  | 'quiz'
  | 'assignment'
  | 'question_bank'
  | 'flashcards'
  | 'ppt'
  | 'study_material';

export interface GeneratedContent {
  id: string;
  courseId: string;
  unitId?: string;
  topicId?: string;
  title: string;
  type: ContentType;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'draft' | 'needs_review' | 'approved' | 'published' | 'rejected';
  contentBody: string; // Markdown or HTML formatted string
  questions?: QuizQuestion[];
  flashcards?: FlashcardItem[];
  metadata?: {
    estimatedReadTimeMinutes?: number;
    questionCount?: number;
    learningObjectivesCovered?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  progress: number; // percentage
  averageScore: number; // percentage
  lastActive: string;
  status: 'On Track' | 'At Risk' | 'Completed' | 'Inactive';
  enrolledCourses: string[];
}

export interface Assignment {
  id: string;
  courseId: string;
  contentId: string;
  title: string;
  assignedToGroups: string[];
  targetStudentIds?: string[];
  dueDate: string;
  maxAttempts: number;
  submittedCount: number;
  pendingCount: number;
  totalAssigned: number;
  createdAt: string;
}

export interface CourseAnalytics {
  courseId: string;
  averageScore: number;
  completionRate: number;
  activeStudents: number;
  atRiskStudents: number;
  topicPerformances: {
    topicId: string;
    topicName: string;
    scorePercentage: number;
    struggleConcepts?: string[];
  }[];
  weeklyEngagement: { day: string; hours: number; activeCount: number }[];
  aiInsights: AIInsight[];
}

export interface AIInsight {
  id: string;
  topicId: string;
  topicName: string;
  averageScore: number;
  severity: 'high' | 'medium' | 'low';
  summary: string;
  struggles: string[];
  recommendation: string;
  remedialActionText: string;
}

export interface GenerationConfig {
  courseId: string;
  unitId?: string;
  topicId?: string;
  contentType: ContentType;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionCount: number;
  learningObjectives: string[];
  additionalPrompt?: string;
}
