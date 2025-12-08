import { ART_TECHNIQUES, TechniqueId } from './artTechniques';

export const AGE_GROUPS = {
  TODDLER: {
    id: 'TODDLER',
    name: 'Toddler',
    nameKo: '유아',
    ageRange: '5-6세',
    description: '유치원생',
    gradeKo: '유치원',
    characteristics: [
      '큰 영역의 단순한 도안',
      '굵은 테두리선 (4-6px)',
      '기본 도형 위주',
      '친근한 캐릭터',
      '최소한의 디테일'
    ],
    recommendedTechniques: [
      'COLORING', 'LINE_DRAWING', 'DOT_CONNECT', 'CUTTING', 'STAMP',
      'PATTERN', 'DOODLE', 'BORDER', 'RUBBING', 'ORIGAMI',
      'MASK', 'PUPPET', 'FRAME', 'COLLAGE', 'COLLABORATIVE'
    ] as TechniqueId[],
    difficultyRange: { min: 1, max: 2 },
    lineThickness: 'thick',
    complexity: 'simple',
    detailLevel: 'low',
    maxActivityTime: 15,
    breakInterval: 10,
    generationParams: {
      lineWeight: 5,
      shapeComplexity: 'basic',
      objectCount: { min: 1, max: 3 },
      backgroundComplexity: 'none',
      labelStyle: 'none'
    }
  },
  LOWER_ELEM: {
    id: 'LOWER_ELEM',
    name: 'Lower Elementary',
    nameKo: '초등 저학년',
    ageRange: '7-9세',
    description: '초등학교 1-3학년',
    gradeKo: '초등 1-3학년',
    characteristics: [
      '중간 크기 영역',
      '적당한 디테일',
      '다양한 주제',
      '단계별 설명 포함',
      '약간의 도전적 요소'
    ],
    recommendedTechniques: [
      'COLORING', 'LINE_DRAWING', 'DOT_CONNECT', 'SYMMETRY', 'MIRROR',
      'GRID_COPY', 'ORIGAMI', 'PAPER_CRAFT', 'CUTTING', 'POPUP',
      'MOBILE', 'COLLAGE', 'STENCIL', 'STAMP', 'RUBBING', 'MARBLING',
      'MOSAIC', 'MANDALA', 'DOODLE', 'PATTERN', 'BORDER', 'SHADING',
      'TEXTURE', 'CONTOUR', 'BOOK_MAKING', 'MASK', 'PUPPET', 'FRAME',
      'COLLABORATIVE'
    ] as TechniqueId[],
    difficultyRange: { min: 2, max: 4 },
    lineThickness: 'medium',
    complexity: 'moderate',
    detailLevel: 'medium',
    maxActivityTime: 25,
    breakInterval: 15,
    generationParams: {
      lineWeight: 3,
      shapeComplexity: 'moderate',
      objectCount: { min: 2, max: 5 },
      backgroundComplexity: 'simple',
      labelStyle: 'optional'
    }
  },
  UPPER_ELEM: {
    id: 'UPPER_ELEM',
    name: 'Upper Elementary',
    nameKo: '초등 고학년',
    ageRange: '10-12세',
    description: '초등학교 4-6학년',
    gradeKo: '초등 4-6학년',
    characteristics: [
      '복잡한 구성',
      '세밀한 디테일',
      '도전적인 기법',
      '창작 요소 포함',
      '자기 주도적 활동'
    ],
    recommendedTechniques: Object.keys(ART_TECHNIQUES) as TechniqueId[],
    difficultyRange: { min: 3, max: 5 },
    lineThickness: 'thin',
    complexity: 'complex',
    detailLevel: 'high',
    maxActivityTime: 45,
    breakInterval: 20,
    generationParams: {
      lineWeight: 2,
      shapeComplexity: 'detailed',
      objectCount: { min: 3, max: 8 },
      backgroundComplexity: 'moderate',
      labelStyle: 'detailed'
    }
  },
  ALL: {
    id: 'ALL',
    name: 'All Ages',
    nameKo: '전체',
    ageRange: '5-12세',
    description: '모든 연령',
    gradeKo: '전체',
    characteristics: ['다양한 난이도 옵션 제공', '연령별 맞춤 가능'],
    recommendedTechniques: Object.keys(ART_TECHNIQUES) as TechniqueId[],
    difficultyRange: { min: 1, max: 5 },
    lineThickness: 'variable',
    complexity: 'variable',
    detailLevel: 'variable',
    maxActivityTime: 30,
    breakInterval: 15,
    generationParams: {
      lineWeight: 3,
      shapeComplexity: 'variable',
      objectCount: { min: 2, max: 5 },
      backgroundComplexity: 'simple',
      labelStyle: 'optional'
    }
  }
} as const;

export type AgeGroupId = keyof typeof AGE_GROUPS;
export type AgeGroup = typeof AGE_GROUPS[AgeGroupId];

// 연령대 관련 헬퍼 함수
export function getAgeGroupById(id: string): AgeGroup | undefined {
  return AGE_GROUPS[id as AgeGroupId];
}

export function getAgeGroupsList() {
  return Object.values(AGE_GROUPS);
}

export function getDifficultyForAgeGroup(ageGroupId: string): { min: number; max: number } {
  const ageGroup = AGE_GROUPS[ageGroupId as AgeGroupId];
  return ageGroup?.difficultyRange || { min: 1, max: 5 };
}

export function getRecommendedTechniques(ageGroupId: string): TechniqueId[] {
  const ageGroup = AGE_GROUPS[ageGroupId as AgeGroupId];
  return ageGroup?.recommendedTechniques || [];
}

export function isTechniqueRecommendedForAge(techniqueId: TechniqueId, ageGroupId: string): boolean {
  const techniques = getRecommendedTechniques(ageGroupId);
  return techniques.includes(techniqueId);
}
