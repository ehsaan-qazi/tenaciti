// Centralized dummy data for the hero product demo.
// All data is internally consistent — progress percentages match topic completion states.

export interface DummyCourse {
  id: string;
  name: string;
  code: string;
  progress: number;
  topicCount: number;
  completedTopics: number;
}

export interface DummyTopic {
  id: string;
  title: string;
  isCompleted: boolean;
  isConfirmed: boolean;
  confidence: number | null; // 1-5 or null
  courseId: string;
}

export interface DummyAssessment {
  id: string;
  title: string;
  type: 'Quiz' | 'Assignment' | 'Exam' | 'Project';
  daysUntil: number;
  courseName: string;
  courseCode: string;
}

export interface DummyRoadmapNode {
  id: string;
  title: string;
  week: number;
  type: string;
  isCompleted: boolean;
}

export interface DummyGoal {
  id: string;
  title: string;
  courseName: string;
  deadline: string;
  relatedItems: number;
}

export interface DummyNote {
  id: string;
  title: string;
  snippet: string;
  linkedTopic?: string;
  courseName: string;
}

export interface DummyDocument {
  id: string;
  filename: string;
  type: 'pdf' | 'pptx';
  sizeKB: number;
  status: 'uploaded' | 'processing' | 'processed';
}

export type SearchArea = 'Notes' | 'Documents' | 'Topics' | 'Courses';

export interface DummySearchHit {
  id: string;
  area: SearchArea;
  title: string;
  sub?: string;
  meta?: string;
}

// ─── Courses ──────────────────────────────────────────────────────
export const courses: DummyCourse[] = [
  { id: 'c1', name: 'Database Systems', code: 'CS-301', progress: 42, topicCount: 12, completedTopics: 5 },
  { id: 'c2', name: 'Object Oriented Programming', code: 'CS-201', progress: 68, topicCount: 10, completedTopics: 7 },
  { id: 'c3', name: 'Software Engineering', code: 'CS-302', progress: 55, topicCount: 8, completedTopics: 4 },
  { id: 'c4', name: 'Computer Networks', code: 'CS-303', progress: 31, topicCount: 11, completedTopics: 3 },
  { id: 'c5', name: 'Operating Systems', code: 'CS-304', progress: 47, topicCount: 9, completedTopics: 4 },
];

// ─── Topics (Database Systems) ────────────────────────────────────
export const dbTopics: DummyTopic[] = [
  { id: 't1', title: 'Introduction to DBMS', isCompleted: true, isConfirmed: true, confidence: 5, courseId: 'c1' },
  { id: 't2', title: 'Relational Model', isCompleted: true, isConfirmed: true, confidence: 4, courseId: 'c1' },
  { id: 't3', title: 'SQL Fundamentals', isCompleted: true, isConfirmed: true, confidence: 3, courseId: 'c1' },
  { id: 't4', title: 'Normalization', isCompleted: false, isConfirmed: true, confidence: null, courseId: 'c1' },
  { id: 't5', title: 'ER Diagrams', isCompleted: true, isConfirmed: true, confidence: 4, courseId: 'c1' },
  { id: 't6', title: 'Transactions', isCompleted: false, isConfirmed: true, confidence: null, courseId: 'c1' },
  { id: 't7', title: 'Indexing & Hashing', isCompleted: false, isConfirmed: true, confidence: null, courseId: 'c1' },
  { id: 't8', title: 'Query Processing', isCompleted: false, isConfirmed: false, confidence: null, courseId: 'c1' },
  { id: 't9', title: 'Concurrency Control', isCompleted: false, isConfirmed: false, confidence: null, courseId: 'c1' },
  { id: 't10', title: 'Recovery Systems', isCompleted: false, isConfirmed: false, confidence: null, courseId: 'c1' },
  { id: 't11', title: 'Distributed Databases', isCompleted: false, isConfirmed: false, confidence: null, courseId: 'c1' },
  { id: 't12', title: 'NoSQL Databases', isCompleted: true, isConfirmed: true, confidence: 3, courseId: 'c1' },
];

// ─── Roadmap Nodes (Database Systems) ─────────────────────────────
export const roadmapNodes: DummyRoadmapNode[] = [
  { id: 'r1', title: 'Database Fundamentals', week: 1, type: 'Lecture', isCompleted: true },
  { id: 'r2', title: 'Relational Model', week: 2, type: 'Lecture', isCompleted: true },
  { id: 'r3', title: 'SQL', week: 3, type: 'Quiz', isCompleted: true },
  { id: 'r4', title: 'Normalization', week: 4, type: 'Assignment', isCompleted: false },
  { id: 'r5', title: 'Transactions', week: 5, type: 'Lecture', isCompleted: false },
  { id: 'r6', title: 'Indexing', week: 6, type: 'Exam', isCompleted: false },
];

// ─── Assessments ──────────────────────────────────────────────────
export const assessments: DummyAssessment[] = [
  { id: 'a1', title: 'DBMS Quiz 2', type: 'Quiz', daysUntil: 3, courseName: 'Database Systems', courseCode: 'CS-301' },
  { id: 'a2', title: 'OOP Assignment 3', type: 'Assignment', daysUntil: 5, courseName: 'Object Oriented Programming', courseCode: 'CS-201' },
  { id: 'a3', title: 'Networks Midterm', type: 'Exam', daysUntil: 9, courseName: 'Computer Networks', courseCode: 'CS-303' },
];

// ─── Documents ────────────────────────────────────────────────────
export const documents: DummyDocument[] = [
  { id: 'd1', filename: 'Database Systems — Course Syllabus.pdf', type: 'pdf', sizeKB: 842, status: 'processed' },
  { id: 'd2', filename: 'DBMS Lecture 04.pdf', type: 'pdf', sizeKB: 1240, status: 'processed' },
  { id: 'd3', filename: 'DBMS Revision Notes.pdf', type: 'pdf', sizeKB: 560, status: 'processed' },
  { id: 'd4', filename: 'OOP Course Outline.pdf', type: 'pdf', sizeKB: 320, status: 'processed' },
];

// ─── Goals ────────────────────────────────────────────────────────
export const goals: DummyGoal[] = [
  { id: 'g1', title: 'Finish Database Systems', courseName: 'Database Systems', deadline: 'Friday', relatedItems: 3 },
  { id: 'g2', title: 'Complete OOP Assignment', courseName: 'Object Oriented Programming', deadline: 'Next Monday', relatedItems: 2 },
  { id: 'g3', title: 'Review Normalization', courseName: 'Database Systems', deadline: 'Wednesday', relatedItems: 1 },
];

// ─── Notes ────────────────────────────────────────────────────────
export const notes: DummyNote[] = [
  { id: 'n1', title: 'Normalization lecture notes', snippet: 'Key forms: 1NF, 2NF, 3NF, BCNF. Focus on functional dependencies...', linkedTopic: 'Normalization', courseName: 'Database Systems' },
  { id: 'n2', title: "Teacher's exam hint", snippet: 'Teacher highlighted Topic 4 as very important for the final exam...', linkedTopic: 'Normalization', courseName: 'Database Systems' },
  { id: 'n3', title: 'Revision notes', snippet: 'Review all normal forms and practice decomposition exercises...', linkedTopic: 'Normalization', courseName: 'Database Systems' },
];

// ─── Search Hits ("Find everything about normalization") ─────────
// Order matters — groups render in the sequence the AI sweeps the workspace.
export const searchHits: DummySearchHit[] = [
  { id: 's1', area: 'Notes', title: 'Normalization lecture notes', sub: 'Key forms: 1NF, 2NF, 3NF, BCNF…', meta: '2h ago' },
  { id: 's2', area: 'Notes', title: "Teacher's exam hint", sub: 'Topic 4 is very important for the final exam', meta: '1d ago' },
  { id: 's3', area: 'Notes', title: 'Revision notes', sub: 'Practice decomposition exercises…', meta: '3d ago' },
  { id: 's4', area: 'Documents', title: 'DBMS Lecture 04.pdf', meta: '1.2 MB' },
  { id: 's5', area: 'Documents', title: 'DBMS Revision Notes.pdf', meta: '560 KB' },
  { id: 's6', area: 'Topics', title: 'Normalization', meta: 'CS-301 · In progress' },
  { id: 's7', area: 'Courses', title: 'Database Systems', meta: 'CS-301 · 42% complete' },
];

export const searchAreas: SearchArea[] = ['Notes', 'Documents', 'Topics', 'Courses'];

// ─── Student Stats ────────────────────────────────────────────────
export const studentStats = {
  gpa: 3.72,
  studyStreak: 12,
  totalCourses: 5,
  totalTopics: 50,
  completedTopics: 23,
};

// ─── AI Processing Steps (reused across scenes) ──────────────────
// Icon keys map to components in ./icons.tsx
export const workspaceScanSteps = [
  { key: 'courses', label: 'Courses', detail: '5 active' },
  { key: 'topics', label: 'Topics', detail: '23 of 50 completed' },
  { key: 'progress', label: 'Progress', detail: 'Up to date' },
  { key: 'assessments', label: 'Assessments', detail: '3 upcoming' },
  { key: 'goals', label: 'Goals', detail: '3 active' },
  { key: 'materials', label: 'Study material', detail: '4 documents' },
] as const;

export const studyNext = {
  topic: 'Normalization',
  courseName: 'Database Systems',
  courseCode: 'CS-301',
  progressPct: 42,
  topicsDone: 5,
  topicsTotal: 12,
  remainingTopics: 7,
  reason: 'DBMS Quiz 2 covers this — and it is your lowest-confidence unfinished unit.',
};

export const goalParseSteps = [
  { key: 'intent', label: 'Intent recognized', value: 'Semester goal' },
  { key: 'deadline', label: 'Deadline parsed', value: 'Friday, Aug 28' },
  { key: 'course', label: 'Course matched', value: 'Database Systems · CS-301' },
] as const;

export const newGoal = {
  title: 'Finish Database Systems',
  badges: ['Active', 'Course Goal'],
  fields: [
    { label: 'Target date', value: 'Fri, Aug 28 · 6 days' },
    { label: 'Linked items', value: '7 remaining topics · 1 quiz' },
    { label: 'Roadmap sync', value: 'Auto-scheduled into Weeks 4–6' },
  ],
  tasksTotal: 8,
  meta: ['Fall 2026', 'Aug 28', '1 course'],
};
