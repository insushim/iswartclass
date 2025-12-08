import { User, Sheet, Curriculum, Class, Student, Portfolio, Assignment, Notification, Achievement, Subscription } from '@prisma/client';

// Re-export Prisma types
export type {
  User,
  Sheet,
  Curriculum,
  Class,
  Student,
  Portfolio,
  Assignment,
  Notification,
  Achievement,
  Subscription
};

// Extended types with relations
export interface UserWithRelations extends User {
  subscription?: Subscription | null;
  sheets?: Sheet[];
  classes?: Class[];
  students?: Student[];
}

export interface SheetWithRelations extends Sheet {
  user?: User;
  favorites?: { userId: string }[];
  _count?: {
    favorites: number;
    comments: number;
  };
}

export interface ClassWithRelations extends Class {
  user?: User;
  students?: Student[];
  assignments?: Assignment[];
  _count?: {
    students: number;
    assignments: number;
  };
}

export interface StudentWithRelations extends Student {
  user?: User;
  class?: Class | null;
  portfolios?: Portfolio[];
  attendance?: { date: Date; status: string }[];
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Generation types
export interface GenerationRequest {
  technique: string;
  theme: string;
  subTheme: string;
  ageGroup: string;
  difficulty: number;
  style?: string;
  additionalDetails?: string;
  count?: number;
}

export interface GenerationResult {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  prompt: string;
  metadata: {
    technique: string;
    theme: string;
    subTheme: string;
    ageGroup: string;
    difficulty: number;
    generatedAt: string;
  };
}

// Filter types
export interface SheetFilters {
  technique?: string;
  theme?: string;
  ageGroup?: string;
  difficulty?: number;
  isPreset?: boolean;
  isPublic?: boolean;
  search?: string;
  tags?: string[];
  sortBy?: 'createdAt' | 'downloads' | 'rating' | 'views';
  sortOrder?: 'asc' | 'desc';
}

export interface CurriculumFilters {
  ageGroup?: string;
  status?: string;
  isTemplate?: boolean;
  isPublic?: boolean;
  search?: string;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  role?: 'TEACHER' | 'PARENT';
  agreeToTerms: boolean;
}

export interface ProfileFormData {
  name: string;
  avatarUrl?: string;
  locale: string;
  timezone: string;
}

export interface SheetFormData {
  title: string;
  description?: string;
  technique: string;
  theme: string;
  subTheme: string;
  ageGroup: string;
  difficulty: number;
  tags?: string[];
  isPublic?: boolean;
}

export interface ClassFormData {
  name: string;
  description?: string;
  ageGroup: string;
  grade?: string;
  color?: string;
  icon?: string;
  maxStudents?: number;
}

export interface StudentFormData {
  name: string;
  nickname?: string;
  ageGroup: string;
  birthDate?: string;
  parentEmail?: string;
  parentPhone?: string;
  classId?: string;
  notes?: string;
}

export interface CurriculumFormData {
  title: string;
  description?: string;
  ageGroup: string;
  weeks: number;
  startDate?: string;
  endDate?: string;
  goals?: string[];
  materials?: string[];
  isTemplate?: boolean;
  isPublic?: boolean;
}

export interface AssignmentFormData {
  title: string;
  description?: string;
  instructions?: string;
  sheetId?: string;
  technique?: string;
  materials?: string[];
  dueDate?: string;
  publishAt?: string;
  isGraded?: boolean;
  maxPoints?: number;
}

// Settings types
export interface UserSettings {
  locale: string;
  timezone: string;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    achievement: boolean;
    assignment: boolean;
    comment: boolean;
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    reduceMotion: boolean;
    screenReader: boolean;
  };
  generator: {
    defaultAgeGroup: string;
    defaultDifficulty: number;
    autoSave: boolean;
    showTips: boolean;
  };
  bgm: {
    enabled: boolean;
    volume: number;
    autoPlay: boolean;
  };
  timer: {
    enabled: boolean;
    breakReminder: boolean;
    breakInterval: number;
  };
}

// Stats types
export interface DashboardStats {
  totalSheets: number;
  totalDownloads: number;
  totalStudents: number;
  activeClasses: number;
  creditsRemaining: number;
  creditsUsed: number;
  recentActivity: Array<{
    type: string;
    description: string;
    createdAt: string;
  }>;
}

export interface StudentProgress {
  studentId: string;
  name: string;
  totalActivities: number;
  completedActivities: number;
  techniqueProgress: Record<string, number>;
  skillLevels: Record<string, number>;
  streakDays: number;
  lastActivityAt: string | null;
  achievements: Array<{
    code: string;
    name: string;
    completedAt: string;
  }>;
}

// Notification types
export interface NotificationPayload {
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
}

// Payment types
export interface PaymentRequest {
  plan: 'BASIC' | 'PREMIUM' | 'UNLIMITED';
  paymentMethod: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

// Marketplace types
export interface MarketplaceItemPreview {
  id: string;
  type: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  ratingCount: number;
  purchases: number;
  seller: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

// Export utility types
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
