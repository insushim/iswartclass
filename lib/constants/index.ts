export * from './artTechniques';
export * from './themes';
export * from './ageGroups';

// 크레딧 관련 상수
export const PLAN_CREDITS = {
  FREE: 30,
  BASIC: 150,
  PREMIUM: 500,
  UNLIMITED: -1, // 무제한
  ENTERPRISE: -1  // 맞춤
} as const;

// 가격 (원화)
export const PLAN_PRICES = {
  FREE: 0,
  BASIC: 9900,
  PREMIUM: 19900,
  UNLIMITED: 39900,
  ENTERPRISE: 0 // 문의
} as const;

// 기본 설정값
export const DEFAULT_SETTINGS = {
  locale: 'ko',
  timezone: 'Asia/Seoul',
  theme: 'light',
  notifications: {
    email: true,
    push: true,
    achievement: true,
    assignment: true,
    comment: true
  },
  accessibility: {
    fontSize: 'medium',
    highContrast: false,
    reduceMotion: false,
    screenReader: false
  },
  generator: {
    defaultAgeGroup: 'LOWER_ELEM',
    defaultDifficulty: 3,
    autoSave: true,
    showTips: true
  },
  bgm: {
    enabled: false,
    volume: 0.5,
    autoPlay: false
  },
  timer: {
    enabled: true,
    breakReminder: true,
    breakInterval: 15
  }
} as const;

// 파일 관련 상수
export const FILE_LIMITS = {
  maxUploadSize: 10 * 1024 * 1024, // 10MB
  maxImageWidth: 4096,
  maxImageHeight: 4096,
  supportedFormats: ['image/png', 'image/jpeg', 'image/webp'],
  thumbnailSize: 400,
  printWidth: 2480,  // A4 300dpi
  printHeight: 3508  // A4 300dpi
} as const;

// API 관련 상수
export const API_LIMITS = {
  maxBatchSize: 10,
  maxConcurrent: 5,
  rateLimitPerMinute: 60,
  cacheTimeShort: 3600,      // 1시간
  cacheTimeMedium: 86400,    // 1일
  cacheTimeLong: 604800      // 7일
} as const;

// 난이도별 설명
export const DIFFICULTY_DESCRIPTIONS = {
  1: {
    name: '매우 쉬움',
    nameEn: 'Very Easy',
    description: '유아도 쉽게 할 수 있는 수준',
    characteristics: ['큰 영역', '단순한 형태', '최소 디테일']
  },
  2: {
    name: '쉬움',
    nameEn: 'Easy',
    description: '초급자에게 적합한 수준',
    characteristics: ['기본 형태', '약간의 디테일', '명확한 구분']
  },
  3: {
    name: '보통',
    nameEn: 'Medium',
    description: '중급자에게 적합한 수준',
    characteristics: ['균형 잡힌 구성', '적당한 디테일', '도전적 요소']
  },
  4: {
    name: '어려움',
    nameEn: 'Hard',
    description: '상급자에게 적합한 수준',
    characteristics: ['복잡한 구성', '세밀한 디테일', '고급 기법']
  },
  5: {
    name: '매우 어려움',
    nameEn: 'Very Hard',
    description: '전문가 수준의 도전',
    characteristics: ['정교한 작업', '많은 디테일', '창의력 필요']
  }
} as const;

// 배지/성취 카테고리
export const ACHIEVEMENT_CATEGORIES = {
  BEGINNER: '입문',
  TECHNIQUE: '기법 마스터',
  STREAK: '연속 활동',
  VOLUME: '활동량',
  SPECIAL: '특별',
  SEASONAL: '시즌'
} as const;

// 색상 팔레트
export const COLOR_PALETTE = {
  primary: '#8B5CF6',    // 보라
  secondary: '#F472B6',  // 핑크
  success: '#10B981',    // 초록
  warning: '#F59E0B',    // 노랑
  error: '#EF4444',      // 빨강
  info: '#3B82F6',       // 파랑
  // 연령대별 색상
  toddler: '#F472B6',
  lowerElem: '#3B82F6',
  upperElem: '#8B5CF6',
  // 카테고리별 색상
  basic: '#10B981',
  drawing: '#3B82F6',
  craft: '#F59E0B',
  mixed: '#8B5CF6',
  pattern: '#EC4899',
  advanced: '#EF4444',
  special: '#6366F1'
} as const;
