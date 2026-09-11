import {
  Course,
  KnowledgeDocument,
  Unit,
  GeneratedContent,
  Student,
  Assignment,
  CourseAnalytics,
  TeacherProfile,
} from '../types';

export const mockTeacherProfile: TeacherProfile = {
  id: 'tch_101',
  name: 'Prof. Sarah Jenkins',
  email: 's.jenkins@university.edu',
  role: 'Head of Computer Science',
  department: 'Computer Science & AI',
  institution: 'Stanford School of Engineering',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
};

export const mockCourses: Course[] = [
  {
    id: 'c_ml_101',
    title: 'Machine Learning & Neural Networks',
    code: 'CS-401',
    subject: 'Computer Science',
    department: 'Engineering',
    semester: 'Fall 2026',
    description: 'Comprehensive study of supervised and unsupervised machine learning algorithms, deep neural network architectures, and statistical model evaluation.',
    learningObjectives: [
      'Understand foundational regression and classification mathematics',
      'Construct deep feed-forward neural networks using modern frameworks',
      'Evaluate model performance using cross-validation and precision-recall metrics',
      'Deploy machine learning models to production environments',
    ],
    workflowStatus: {
      create: 'completed',
      knowledge: 'completed',
      builder: 'completed',
      review: 'in_progress',
      publish: 'pending',
      students: 'pending',
      analytics: 'pending',
      improve: 'pending',
    },
    overallProgress: 65,
    studentsCount: 248,
    contentCount: 18,
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-10T14:30:00Z',
  },
  {
    id: 'c_dsa_202',
    title: 'Data Structures & Algorithms II',
    code: 'CS-202',
    subject: 'Computer Science',
    department: 'Engineering',
    semester: 'Fall 2026',
    description: 'Advanced graph algorithms, dynamic programming strategies, and algorithmic complexity analysis.',
    learningObjectives: [
      'Master dynamic programming algorithms and memoization strategies',
      'Implement advanced graph search algorithms including Dijkstra and A*',
      'Analyze time and space complexity using asymptotic notation',
    ],
    workflowStatus: {
      create: 'completed',
      knowledge: 'completed',
      builder: 'completed',
      review: 'completed',
      publish: 'completed',
      students: 'completed',
      analytics: 'needs_attention',
      improve: 'in_progress',
    },
    overallProgress: 88,
    studentsCount: 312,
    contentCount: 24,
    createdAt: '2026-07-15T09:00:00Z',
    updatedAt: '2026-08-11T01:00:00Z',
  },
  {
    id: 'c_cloud_303',
    title: 'Cloud Architecture & Distributed Systems',
    code: 'CS-505',
    subject: 'Cloud Computing',
    department: 'Computer Science',
    semester: 'Fall 2026',
    description: 'Principles of containerization, microservices architecture, serverless design patterns, and distributed consensus.',
    learningObjectives: [
      'Design fault-tolerant cloud infrastructure on multi-region platforms',
      'Implement container orchestration using Kubernetes',
    ],
    workflowStatus: {
      create: 'completed',
      knowledge: 'completed',
      builder: 'in_progress',
      review: 'pending',
      publish: 'pending',
      students: 'pending',
      analytics: 'pending',
      improve: 'pending',
    },
    overallProgress: 35,
    studentsCount: 180,
    contentCount: 6,
    createdAt: '2026-08-05T11:20:00Z',
    updatedAt: '2026-08-09T16:45:00Z',
  },
];

export const mockDocuments: Record<string, KnowledgeDocument[]> = {
  c_ml_101: [
    {
      id: 'doc_1',
      courseId: 'c_ml_101',
      fileName: 'Machine Learning Syllabus 2026.pdf',
      fileSize: '8.4 MB',
      fileType: 'pdf',
      category: 'Syllabus',
      status: 'processed',
      chunkCount: 124,
      unitCount: 8,
      topicCount: 46,
      uploadedAt: '2026-08-02T11:00:00Z',
    },
    {
      id: 'doc_2',
      courseId: 'c_ml_101',
      fileName: 'Supervised Learning & Regression Notes.pdf',
      fileSize: '14.2 MB',
      fileType: 'pdf',
      category: 'Notes',
      status: 'processed',
      chunkCount: 210,
      unitCount: 3,
      topicCount: 18,
      uploadedAt: '2026-08-03T14:15:00Z',
    },
    {
      id: 'doc_3',
      courseId: 'c_ml_101',
      fileName: 'Midterm Question Bank & Solutions.pdf',
      fileSize: '4.8 MB',
      fileType: 'pdf',
      category: 'Question Papers',
      status: 'processed',
      chunkCount: 88,
      uploadedAt: '2026-08-04T09:30:00Z',
    },
    {
      id: 'doc_4',
      courseId: 'c_ml_101',
      fileName: 'Deep Learning Specialization Reference.pdf',
      fileSize: '22.1 MB',
      fileType: 'pdf',
      category: 'Reference Materials',
      status: 'processing',
      chunkCount: 450,
      uploadedAt: '2026-08-10T18:20:00Z',
    },
  ],
};

export const mockUnits: Record<string, Unit[]> = {
  c_ml_101: [
    {
      id: 'u_1',
      courseId: 'c_ml_101',
      unitNumber: 1,
      title: 'Introduction to Machine Learning & Foundations',
      topics: [
        {
          id: 't_1_1',
          title: 'Fundamentals of Machine Learning',
          completed: true,
          contentsCount: 4,
          status: 'published',
        },
        {
          id: 't_1_2',
          title: 'Types of Learning: Supervised, Unsupervised & RL',
          completed: true,
          contentsCount: 3,
          status: 'published',
        },
        {
          id: 't_1_3',
          title: 'Linear & Logistic Regression Analysis',
          completed: true,
          contentsCount: 5,
          status: 'reviewed',
        },
      ],
    },
    {
      id: 'u_2',
      courseId: 'c_ml_101',
      unitNumber: 2,
      title: 'Supervised Learning Algorithms',
      topics: [
        {
          id: 't_2_1',
          title: 'Decision Trees & Random Forests',
          completed: true,
          contentsCount: 3,
          status: 'reviewed',
        },
        {
          id: 't_2_2',
          title: 'Support Vector Machines (SVM)',
          completed: false,
          contentsCount: 2,
          status: 'generated',
        },
        {
          id: 't_2_3',
          title: 'Model Evaluation Metrics & Cross Validation',
          completed: false,
          contentsCount: 1,
          status: 'generating',
          averageScore: 54,
        },
      ],
    },
    {
      id: 'u_3',
      courseId: 'c_ml_101',
      unitNumber: 3,
      title: 'Neural Networks & Deep Learning',
      topics: [
        {
          id: 't_3_1',
          title: 'Perceptrons & Backpropagation',
          completed: false,
          contentsCount: 0,
          status: 'not_generated',
        },
        {
          id: 't_3_2',
          title: 'Convolutional Neural Networks (CNNs)',
          completed: false,
          contentsCount: 0,
          status: 'not_generated',
        },
      ],
    },
  ],
};

export const mockContents: Record<string, GeneratedContent[]> = {
  c_ml_101: [
    {
      id: 'cnt_101',
      courseId: 'c_ml_101',
      unitId: 'u_1',
      topicId: 't_1_3',
      title: 'Lecture Notes: Comprehensive Linear & Logistic Regression',
      type: 'lecture_notes',
      difficulty: 'Medium',
      status: 'needs_review',
      createdAt: '2026-08-09T10:00:00Z',
      updatedAt: '2026-08-10T12:00:00Z',
      metadata: {
        estimatedReadTimeMinutes: 15,
        learningObjectivesCovered: ['Understand regression formulas', 'Derive cost function gradient descent'],
      },
      contentBody: `# Introduction to Linear & Logistic Regression

## 1. Linear Regression Overview
Linear regression models the linear relationship between a continuous dependent variable $Y$ and one or more independent variables $X$.

### Mathematical Formulation
The linear hypothesis is given by:
$$\\hat{y} = h_\\theta(x) = \\theta_0 + \\theta_1 x_1 + \\theta_2 x_2 + ... + \\theta_n x_n$$

### Cost Function (Mean Squared Error)
$$J(\\theta) = \\frac{1}{2m} \\sum_{i=1}^{m} (h_\\theta(x^{(i)}) - y^{(i)})^2$$

---

## 2. Gradient Descent Algorithm
To minimize $J(\\theta)$, we iteratively update weights along the negative gradient direction:
$$\\theta_j := \\theta_j - \\alpha \\frac{\\partial}{\\partial \\theta_j} J(\\theta)$$

Where:
- $\\alpha$ is the learning rate parameter.
- $m$ is the total number of training examples.

---

## 3. Logistic Regression for Binary Classification
When the outcome variable is categorical (0 or 1), we apply the Sigmoid activation function:
$$g(z) = \\frac{1}{1 + e^{-z}}$$

### Key Takeaways
1. Linear Regression predicts **continuous** scalar values.
2. Logistic Regression outputs **probabilities** bounded between 0 and 1.
3. Feature scaling (standardization) accelerates gradient convergence.`,
    },
    {
      id: 'cnt_102',
      courseId: 'c_ml_101',
      unitId: 'u_2',
      topicId: 't_2_3',
      title: 'Unit 2 Assessment: Model Evaluation & Precision-Recall Quiz',
      type: 'quiz',
      difficulty: 'Hard',
      status: 'needs_review',
      createdAt: '2026-08-10T15:00:00Z',
      updatedAt: '2026-08-10T15:00:00Z',
      contentBody: 'Interactive 10-question quiz testing student knowledge on Confusion Matrices, Precision, Recall, F1-Score, and K-Fold Cross Validation.',
      metadata: {
        questionCount: 10,
      },
      questions: [
        {
          id: 'q1',
          question: 'In a binary classification model detecting a rare disease, which metric is most critical when False Negatives are severely dangerous?',
          options: ['Accuracy', 'Recall (Sensitivity)', 'Precision', 'Specificity'],
          correctAnswer: 1,
          explanation: 'Recall measures the fraction of actual positive cases correctly identified. High recall minimizes dangerous false negatives.',
        },
        {
          id: 'q2',
          question: 'What happens to Precision and Recall when you increase the decision threshold of a logistic regression model from 0.5 to 0.8?',
          options: [
            'Precision increases, Recall decreases',
            'Precision decreases, Recall increases',
            'Both Precision and Recall increase',
            'Both Precision and Recall decrease',
          ],
          correctAnswer: 0,
          explanation: 'Raising the classification threshold makes the model more conservative in predicting positive labels, increasing Precision but reducing Recall.',
        },
        {
          id: 'q3',
          question: 'In 5-Fold Cross Validation, how many times is the model trained and evaluated across disjoint subsets?',
          options: ['1 time', '5 times', '25 times', '10 times'],
          correctAnswer: 1,
          explanation: 'The dataset is split into 5 equal folds; the model trains on 4 folds and tests on 1 fold, repeated 5 distinct times.',
        },
      ],
    },
  ],
};

export const mockStudents: Student[] = [
  {
    id: 's_1',
    name: 'Arun Kumar',
    email: 'arun.k@student.university.edu',
    progress: 78,
    averageScore: 84,
    lastActive: 'Today',
    status: 'On Track',
    enrolledCourses: ['c_ml_101', 'c_dsa_202'],
  },
  {
    id: 's_2',
    name: 'Priya Sharma',
    email: 'priya.s@student.university.edu',
    progress: 42,
    averageScore: 58,
    lastActive: '3 days ago',
    status: 'At Risk',
    enrolledCourses: ['c_ml_101'],
  },
  {
    id: 's_3',
    name: 'David Chen',
    email: 'david.c@student.university.edu',
    progress: 95,
    averageScore: 92,
    lastActive: '1 hour ago',
    status: 'Completed',
    enrolledCourses: ['c_ml_101', 'c_cloud_303'],
  },
  {
    id: 's_4',
    name: 'Maya Lin',
    email: 'maya.l@student.university.edu',
    progress: 51,
    averageScore: 61,
    lastActive: 'Yesterday',
    status: 'At Risk',
    enrolledCourses: ['c_ml_101'],
  },
  {
    id: 's_5',
    name: 'Marcus Vance',
    email: 'marcus.v@student.university.edu',
    progress: 82,
    averageScore: 88,
    lastActive: 'Today',
    status: 'On Track',
    enrolledCourses: ['c_ml_101'],
  },
];

export const mockAssignments: Assignment[] = [
  {
    id: 'asg_1',
    courseId: 'c_ml_101',
    contentId: 'cnt_102',
    title: 'Model Evaluation & Confusion Matrix Quiz',
    assignedToGroups: ['CS-401 Section A', 'CS-401 Section B'],
    dueDate: '2026-08-20',
    maxAttempts: 2,
    submittedCount: 184,
    pendingCount: 64,
    totalAssigned: 248,
    createdAt: '2026-08-08T10:00:00Z',
  },
];

export const mockAnalytics: Record<string, CourseAnalytics> = {
  c_ml_101: {
    courseId: 'c_ml_101',
    averageScore: 74,
    completionRate: 68,
    activeStudents: 192,
    atRiskStudents: 24,
    topicPerformances: [
      { topicId: 't_1_1', topicName: 'ML Fundamentals', scorePercentage: 89 },
      { topicId: 't_1_2', topicName: 'Types of Learning', scorePercentage: 82 },
      { topicId: 't_1_3', topicName: 'Linear & Logistic Regression', scorePercentage: 76 },
      { topicId: 't_2_1', topicName: 'Decision Trees & Random Forests', scorePercentage: 71 },
      {
        topicId: 't_2_3',
        topicName: 'Model Evaluation & Metrics',
        scorePercentage: 54,
        struggleConcepts: ['Precision vs Recall Tradeoff', 'Confusion Matrix Interpretation', 'K-Fold Cross Validation'],
      },
    ],
    weeklyEngagement: [
      { day: 'Mon', hours: 4.2, activeCount: 180 },
      { day: 'Tue', hours: 5.8, activeCount: 210 },
      { day: 'Wed', hours: 6.1, activeCount: 230 },
      { day: 'Thu', hours: 5.4, activeCount: 195 },
      { day: 'Fri', hours: 3.9, activeCount: 160 },
      { day: 'Sat', hours: 2.1, activeCount: 90 },
      { day: 'Sun', hours: 3.0, activeCount: 120 },
    ],
    aiInsights: [
      {
        id: 'ins_1',
        topicId: 't_2_3',
        topicName: 'Model Evaluation & Cross Validation',
        averageScore: 54,
        severity: 'high',
        summary: 'Class performance dropped by 22% on Model Evaluation concept questions.',
        struggles: [
          'Confusion Matrix false-positive vs false-negative classification',
          'Precision/Recall trade-off curve interpretation',
          'K-Fold Cross Validation variance estimation',
        ],
        recommendation: 'Generate targeted remedial material with visual diagrams and 10 step-by-step practice problems for Model Evaluation.',
        remedialActionText: 'Generate Remedial Content Package',
      },
    ],
  },
};
