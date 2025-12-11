import { GoogleGenerativeAI } from '@google/generative-ai';
import { geminiTextModel } from './client';
import { generateArtSheetPrompt, PromptOptions } from './prompts/base';

const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || '';

export interface GenerateOptions extends PromptOptions {
  count?: number;
  addWatermark?: boolean;
}

export interface GeneratedSheet {
  imageUrl: string;
  thumbnailUrl: string;
  originalUrl?: string;
  prompt: string;
  cached: boolean;
  metadata: {
    technique: string;
    theme: string;
    subTheme: string;
    ageGroup: string;
    difficulty: number;
    generatedAt: string;
    modelVersion: string;
  };
}

// 테마별 한국어-영어 매핑
const themeTranslations: Record<string, { ko: string; en: string; subjects: string[] }> = {
  ANIMALS: {
    ko: '동물',
    en: 'Animals',
    subjects: ['cute cat sitting', 'happy puppy', 'rabbit with carrots', 'elephant', 'lion', 'butterfly', 'bird on branch', 'fish in water', 'turtle', 'panda bear']
  },
  NATURE: {
    ko: '자연',
    en: 'Nature',
    subjects: ['flower garden', 'tree with leaves', 'sun and clouds', 'rainbow', 'mountains', 'forest scene', 'mushrooms', 'sunflower', 'rose flower', 'tulip garden']
  },
  VEHICLES: {
    ko: '탈것',
    en: 'Vehicles',
    subjects: ['car', 'airplane', 'train', 'bus', 'bicycle', 'helicopter', 'boat', 'fire truck', 'police car', 'rocket ship']
  },
  FOOD: {
    ko: '음식',
    en: 'Food',
    subjects: ['apple', 'ice cream cone', 'birthday cake', 'pizza slice', 'fruits basket', 'vegetables', 'cupcake', 'donut', 'watermelon slice', 'lollipop']
  },
  SPACE: {
    ko: '우주',
    en: 'Space',
    subjects: ['rocket ship', 'astronaut', 'planet with rings', 'stars and moon', 'alien spaceship', 'solar system', 'meteor', 'space station', 'satellite', 'comet']
  },
  OCEAN: {
    ko: '바다',
    en: 'Ocean',
    subjects: ['fish swimming', 'octopus', 'starfish', 'seahorse', 'whale', 'dolphin jumping', 'crab', 'jellyfish', 'shark', 'sea turtle']
  },
  FANTASY: {
    ko: '판타지',
    en: 'Fantasy',
    subjects: ['unicorn', 'dragon', 'fairy with wings', 'castle', 'mermaid', 'wizard', 'magic wand', 'rainbow unicorn', 'phoenix bird', 'fairy tale house']
  },
  SPORTS: {
    ko: '스포츠',
    en: 'Sports',
    subjects: ['soccer ball', 'basketball', 'tennis racket', 'baseball bat', 'swimming', 'running figure', 'cycling', 'skateboard', 'volleyball', 'golf club']
  },
  SEASONS: {
    ko: '계절',
    en: 'Seasons',
    subjects: ['spring flowers', 'summer beach', 'autumn leaves', 'winter snowman', 'cherry blossoms', 'sun umbrella', 'falling leaves', 'snow scene']
  },
  HOLIDAYS: {
    ko: '명절/기념일',
    en: 'Holidays',
    subjects: ['christmas tree', 'easter eggs', 'halloween pumpkin', 'birthday party', 'valentines heart', 'thanksgiving turkey', 'new year fireworks', 'lantern festival']
  }
};

// 기법별 상세 프롬프트
const techniquePrompts: Record<string, (subject: string, details: string) => string> = {
  COLORING: (subject, details) => `Create a professional children's coloring book page illustration.

SUBJECT: ${subject}
${details ? `SPECIFIC DETAILS: ${details}` : ''}

STRICT REQUIREMENTS:
1. STYLE: Clean black line art on pure white background
2. LINES: Bold, smooth, consistent 3-4px black outlines
3. COMPOSITION: Single main subject centered, clearly defined
4. ANATOMY: Correct proportions - head, body, limbs properly positioned and NOT overlapping incorrectly
5. SPACES: Large, clearly separated areas for easy coloring
6. DETAILS: Age-appropriate details, not too complex
7. NO shading, NO gradients, NO filled areas, NO gray tones
8. NO text, NO watermarks, NO signatures
9. Professional coloring book quality, print-ready at 300dpi

OUTPUT: Black line art illustration suitable for children's coloring book, cute and appealing style.`,

  MANDALA: (subject, details) => `Create a circular mandala coloring page design.

THEME INSPIRATION: ${subject}
${details ? `SPECIFIC ELEMENTS: ${details}` : ''}

STRICT REQUIREMENTS:
1. SHAPE: Perfect circular mandala design
2. SYMMETRY: 8-fold or 12-fold radial symmetry from center
3. LAYERS: 4-5 concentric pattern rings from center outward
4. STYLE: Black line art on white background only
5. PATTERNS: Incorporate ${subject}-inspired motifs in the pattern
6. LINES: Clean, consistent stroke width throughout
7. SPACES: Clearly defined areas for coloring
8. NO shading, NO gradients, NO filled areas
9. Professional quality, print-ready

OUTPUT: Symmetrical mandala design with themed elements, suitable for meditative coloring.`,

  ORIGAMI: (subject, details) => `Create a step-by-step origami folding instruction sheet.

SUBJECT TO FOLD: ${subject}
${details ? `NOTES: ${details}` : ''}

STRICT REQUIREMENTS:
1. LAYOUT: 6-8 numbered steps in sequential order
2. DIAGRAMS: Clear fold lines (dashed for valley, dash-dot for mountain)
3. ARROWS: Direction arrows showing fold movements
4. PROGRESSION: Each step shows one fold action
5. FINAL: Last panel shows completed ${subject}
6. STYLE: Technical line drawings, black on white
7. LABELS: Step numbers clearly visible
8. Professional origami instruction quality

OUTPUT: Clear origami instruction diagram that children can follow.`,

  PATTERN: (subject, details) => `Create a pattern practice worksheet for children.

PATTERN THEME: ${subject}
${details ? `SPECIFIC PATTERNS: ${details}` : ''}

STRICT REQUIREMENTS:
1. TOP SECTION: Complete pattern examples (2-3 repetitions)
2. MIDDLE: Partially completed patterns for tracing
3. BOTTOM: Empty grid/lines for independent practice
4. ELEMENTS: Simple shapes based on ${subject} theme
5. STYLE: Black line art on white background
6. GUIDES: Dotted guide lines where appropriate
7. PROGRESSION: Easy to moderate difficulty
8. Print-ready worksheet format

OUTPUT: Educational pattern worksheet with clear examples and practice areas.`,

  DOT_CONNECT: (subject, details) => `Create a connect-the-dots activity page.

HIDDEN IMAGE: ${subject}
${details ? `DETAILS: ${details}` : ''}

STRICT REQUIREMENTS:
1. DOTS: 30-50 numbered dots forming the outline of ${subject}
2. NUMBERS: Clear, sequential numbering (1, 2, 3...)
3. SPACING: Even dot spacing for smooth lines when connected
4. REVEAL: When connected, dots reveal a clear ${subject} image
5. BACKGROUND: Pure white
6. DOT SIZE: Visible but not too large (5-8px)
7. Some dots may be partially connected as hints
8. Professional activity book quality

OUTPUT: Connect-the-dots puzzle that reveals ${subject} when completed.`,

  LINE_DRAWING: (subject, details) => `Create a line tracing and drawing practice worksheet.

SUBJECT TO DRAW: ${subject}
${details ? `FOCUS: ${details}` : ''}

STRICT REQUIREMENTS:
1. TOP: Complete example drawing of ${subject}
2. MIDDLE: Same drawing with dotted/light lines to trace
3. BOTTOM: Empty box for independent drawing practice
4. STYLE: Simple, clean line art
5. LINES: Clear traceable outlines
6. GUIDES: Grid or guide points for proportion help
7. Appropriate complexity for children
8. Print-ready worksheet format

OUTPUT: Drawing practice sheet with example, tracing, and practice sections.`,

  MAZE: (subject, details) => `Create a maze activity page themed around ${subject}.

THEME: ${subject}
${details ? `SCENARIO: ${details}` : ''}

STRICT REQUIREMENTS:
1. START/END: Clear marked entry and exit points
2. PATH: Single solution path, no dead-ends too long
3. WALLS: Clean black lines on white background
4. THEME: Maze shape or decorations related to ${subject}
5. DIFFICULTY: Age-appropriate, solvable
6. DECORATIONS: Themed elements at start/end points
7. Professional activity book quality

OUTPUT: Fun themed maze puzzle for children.`
};

// 연령대별 복잡도 가이드
const ageComplexityGuide: Record<string, { complexity: string; lineWeight: string; details: string }> = {
  TODDLER: {
    complexity: 'Very simple shapes, maximum 5-6 elements',
    lineWeight: 'Extra bold lines (4-5px)',
    details: 'Minimal details, large coloring areas, friendly rounded shapes'
  },
  LOWER_ELEM: {
    complexity: 'Simple to moderate, 8-12 elements',
    lineWeight: 'Bold lines (3-4px)',
    details: 'Some details but clearly separated areas, medium-sized spaces'
  },
  UPPER_ELEM: {
    complexity: 'Moderate to detailed, 15-20 elements',
    lineWeight: 'Medium lines (2-3px)',
    details: 'More intricate patterns, smaller areas, challenging but achievable'
  },
  ALL: {
    complexity: 'Moderate complexity suitable for ages 5-12',
    lineWeight: 'Standard lines (3px)',
    details: 'Balanced detail level, various area sizes'
  }
};

// 고품질 SVG 템플릿 생성
function generateHighQualitySVG(
  technique: string,
  theme: string,
  subTheme: string,
  additionalDetails: string,
  ageGroup: string,
  difficulty: number
): string {
  const themeInfo = themeTranslations[theme] || themeTranslations.ANIMALS;
  const ageInfo = ageComplexityGuide[ageGroup] || ageComplexityGuide.ALL;

  // 랜덤 주제 선택 또는 서브테마 사용
  const subjectIndex = Math.floor(Math.random() * themeInfo.subjects.length);
  const subject = subTheme || themeInfo.subjects[subjectIndex];

  const techniqueLabel: Record<string, string> = {
    COLORING: '색칠하기',
    MANDALA: '만다라',
    ORIGAMI: '종이접기',
    PATTERN: '패턴 연습',
    DOT_CONNECT: '점잇기',
    LINE_DRAWING: '선 그리기',
    MAZE: '미로찾기'
  };

  // 테마별 고품질 SVG 일러스트레이션
  const svgTemplates: Record<string, Record<string, string>> = {
    ANIMALS: {
      cat: `
        <!-- 고양이 전신 - 비례 정확 -->
        <g transform="translate(400, 450)">
          <!-- 몸통 (타원형) -->
          <ellipse cx="0" cy="50" rx="80" ry="60" fill="none" stroke="#222" stroke-width="3"/>

          <!-- 머리 (몸통 위에 위치) -->
          <circle cx="0" cy="-40" r="55" fill="none" stroke="#222" stroke-width="3"/>

          <!-- 귀 (머리 위) -->
          <path d="M-35 -85 L-45 -130 L-15 -95 Z" fill="none" stroke="#222" stroke-width="3"/>
          <path d="M35 -85 L45 -130 L15 -95 Z" fill="none" stroke="#222" stroke-width="3"/>
          <!-- 귀 안쪽 -->
          <path d="M-33 -90 L-40 -120 L-20 -95" fill="none" stroke="#222" stroke-width="2"/>
          <path d="M33 -90 L40 -120 L20 -95" fill="none" stroke="#222" stroke-width="2"/>

          <!-- 눈 -->
          <ellipse cx="-20" cy="-45" rx="12" ry="15" fill="none" stroke="#222" stroke-width="2"/>
          <ellipse cx="20" cy="-45" rx="12" ry="15" fill="none" stroke="#222" stroke-width="2"/>
          <!-- 눈동자 -->
          <ellipse cx="-20" cy="-43" rx="5" ry="8" fill="#222"/>
          <ellipse cx="20" cy="-43" rx="5" ry="8" fill="#222"/>

          <!-- 코 -->
          <path d="M0 -25 L-8 -15 L8 -15 Z" fill="#222"/>

          <!-- 입/수염 -->
          <path d="M0 -15 L0 -5" stroke="#222" stroke-width="2"/>
          <path d="M0 -5 Q-15 5 -25 0" fill="none" stroke="#222" stroke-width="2"/>
          <path d="M0 -5 Q15 5 25 0" fill="none" stroke="#222" stroke-width="2"/>

          <!-- 수염 -->
          <line x1="-25" y1="-20" x2="-60" y2="-25" stroke="#222" stroke-width="2"/>
          <line x1="-25" y1="-15" x2="-60" y2="-15" stroke="#222" stroke-width="2"/>
          <line x1="-25" y1="-10" x2="-60" y2="-5" stroke="#222" stroke-width="2"/>
          <line x1="25" y1="-20" x2="60" y2="-25" stroke="#222" stroke-width="2"/>
          <line x1="25" y1="-15" x2="60" y2="-15" stroke="#222" stroke-width="2"/>
          <line x1="25" y1="-10" x2="60" y2="-5" stroke="#222" stroke-width="2"/>

          <!-- 앞발 -->
          <ellipse cx="-40" cy="110" rx="20" ry="15" fill="none" stroke="#222" stroke-width="3"/>
          <ellipse cx="40" cy="110" rx="20" ry="15" fill="none" stroke="#222" stroke-width="3"/>
          <!-- 발가락 -->
          <path d="M-50 105 L-50 115" stroke="#222" stroke-width="2"/>
          <path d="M-40 105 L-40 118" stroke="#222" stroke-width="2"/>
          <path d="M-30 105 L-30 115" stroke="#222" stroke-width="2"/>
          <path d="M50 105 L50 115" stroke="#222" stroke-width="2"/>
          <path d="M40 105 L40 118" stroke="#222" stroke-width="2"/>
          <path d="M30 105 L30 115" stroke="#222" stroke-width="2"/>

          <!-- 꼬리 -->
          <path d="M80 30 Q130 0 120 -50 Q115 -70 100 -60" fill="none" stroke="#222" stroke-width="3"/>
        </g>
      `,
      dog: `
        <!-- 강아지 전신 -->
        <g transform="translate(400, 420)">
          <!-- 몸통 -->
          <ellipse cx="0" cy="60" rx="90" ry="55" fill="none" stroke="#222" stroke-width="3"/>

          <!-- 머리 -->
          <ellipse cx="0" cy="-30" rx="60" ry="50" fill="none" stroke="#222" stroke-width="3"/>

          <!-- 귀 (늘어진 귀) -->
          <path d="M-50 -40 Q-80 -20 -70 40 Q-65 60 -45 50" fill="none" stroke="#222" stroke-width="3"/>
          <path d="M50 -40 Q80 -20 70 40 Q65 60 45 50" fill="none" stroke="#222" stroke-width="3"/>

          <!-- 눈 -->
          <circle cx="-20" cy="-35" r="12" fill="none" stroke="#222" stroke-width="2"/>
          <circle cx="20" cy="-35" r="12" fill="none" stroke="#222" stroke-width="2"/>
          <circle cx="-18" cy="-33" r="5" fill="#222"/>
          <circle cx="22" cy="-33" r="5" fill="#222"/>

          <!-- 코 -->
          <ellipse cx="0" cy="-5" rx="15" ry="12" fill="#222"/>

          <!-- 입 -->
          <path d="M0 7 Q0 20 -20 25" fill="none" stroke="#222" stroke-width="2"/>
          <path d="M0 7 Q0 20 20 25" fill="none" stroke="#222" stroke-width="2"/>

          <!-- 혀 -->
          <ellipse cx="0" cy="30" rx="12" ry="18" fill="none" stroke="#222" stroke-width="2"/>

          <!-- 다리 -->
          <rect x="-60" y="100" width="25" height="50" rx="10" fill="none" stroke="#222" stroke-width="3"/>
          <rect x="-25" y="100" width="25" height="50" rx="10" fill="none" stroke="#222" stroke-width="3"/>
          <rect x="0" y="100" width="25" height="50" rx="10" fill="none" stroke="#222" stroke-width="3"/>
          <rect x="35" y="100" width="25" height="50" rx="10" fill="none" stroke="#222" stroke-width="3"/>

          <!-- 꼬리 -->
          <path d="M90 40 Q120 20 110 -20 Q105 -40 120 -50" fill="none" stroke="#222" stroke-width="3"/>
        </g>
      `,
      rabbit: `
        <!-- 토끼 -->
        <g transform="translate(400, 450)">
          <!-- 몸통 -->
          <ellipse cx="0" cy="40" rx="70" ry="80" fill="none" stroke="#222" stroke-width="3"/>

          <!-- 머리 -->
          <circle cx="0" cy="-60" r="50" fill="none" stroke="#222" stroke-width="3"/>

          <!-- 귀 (길고 쫑긋한) -->
          <ellipse cx="-25" cy="-150" rx="15" ry="60" fill="none" stroke="#222" stroke-width="3"/>
          <ellipse cx="25" cy="-150" rx="15" ry="60" fill="none" stroke="#222" stroke-width="3"/>
          <!-- 귀 안쪽 -->
          <ellipse cx="-25" cy="-150" rx="8" ry="45" fill="none" stroke="#222" stroke-width="2"/>
          <ellipse cx="25" cy="-150" rx="8" ry="45" fill="none" stroke="#222" stroke-width="2"/>

          <!-- 눈 -->
          <circle cx="-18" cy="-65" r="10" fill="none" stroke="#222" stroke-width="2"/>
          <circle cx="18" cy="-65" r="10" fill="none" stroke="#222" stroke-width="2"/>
          <circle cx="-16" cy="-63" r="4" fill="#222"/>
          <circle cx="20" cy="-63" r="4" fill="#222"/>

          <!-- 코 -->
          <ellipse cx="0" cy="-45" rx="8" ry="6" fill="#222"/>

          <!-- 입 -->
          <path d="M0 -39 L0 -30" stroke="#222" stroke-width="2"/>
          <path d="M0 -30 Q-10 -25 -15 -35" fill="none" stroke="#222" stroke-width="2"/>
          <path d="M0 -30 Q10 -25 15 -35" fill="none" stroke="#222" stroke-width="2"/>

          <!-- 수염 -->
          <line x1="-20" y1="-45" x2="-50" y2="-50" stroke="#222" stroke-width="1.5"/>
          <line x1="-20" y1="-40" x2="-50" y2="-40" stroke="#222" stroke-width="1.5"/>
          <line x1="20" y1="-45" x2="50" y2="-50" stroke="#222" stroke-width="1.5"/>
          <line x1="20" y1="-40" x2="50" y2="-40" stroke="#222" stroke-width="1.5"/>

          <!-- 앞발 -->
          <ellipse cx="-30" cy="100" rx="18" ry="25" fill="none" stroke="#222" stroke-width="3"/>
          <ellipse cx="30" cy="100" rx="18" ry="25" fill="none" stroke="#222" stroke-width="3"/>

          <!-- 뒷발 -->
          <ellipse cx="-50" cy="120" rx="30" ry="18" fill="none" stroke="#222" stroke-width="3"/>
          <ellipse cx="50" cy="120" rx="30" ry="18" fill="none" stroke="#222" stroke-width="3"/>

          <!-- 꼬리 -->
          <circle cx="0" cy="120" r="20" fill="none" stroke="#222" stroke-width="3"/>
        </g>
      `
    },
    NATURE: {
      flower: `
        <!-- 꽃 -->
        <g transform="translate(400, 400)">
          <!-- 꽃잎들 -->
          <ellipse cx="0" cy="-80" rx="35" ry="55" fill="none" stroke="#222" stroke-width="3"/>
          <ellipse cx="60" cy="-40" rx="35" ry="55" fill="none" stroke="#222" stroke-width="3" transform="rotate(72)"/>
          <ellipse cx="40" cy="50" rx="35" ry="55" fill="none" stroke="#222" stroke-width="3" transform="rotate(144)"/>
          <ellipse cx="-40" cy="50" rx="35" ry="55" fill="none" stroke="#222" stroke-width="3" transform="rotate(216)"/>
          <ellipse cx="-60" cy="-40" rx="35" ry="55" fill="none" stroke="#222" stroke-width="3" transform="rotate(288)"/>

          <!-- 꽃술 (중앙) -->
          <circle cx="0" cy="0" r="30" fill="none" stroke="#222" stroke-width="3"/>
          <circle cx="0" cy="0" r="15" fill="none" stroke="#222" stroke-width="2"/>
          <!-- 꽃술 점들 -->
          <circle cx="-8" cy="-8" r="3" fill="#222"/>
          <circle cx="8" cy="-8" r="3" fill="#222"/>
          <circle cx="-8" cy="8" r="3" fill="#222"/>
          <circle cx="8" cy="8" r="3" fill="#222"/>
          <circle cx="0" cy="0" r="3" fill="#222"/>

          <!-- 줄기 -->
          <path d="M0 55 Q10 100 0 180" fill="none" stroke="#222" stroke-width="4"/>

          <!-- 잎 1 -->
          <path d="M0 100 Q-60 80 -80 120 Q-60 140 0 110" fill="none" stroke="#222" stroke-width="3"/>
          <path d="M0 105 Q-40 100 -50 115" fill="none" stroke="#222" stroke-width="2"/>

          <!-- 잎 2 -->
          <path d="M0 140 Q60 120 80 160 Q60 180 0 150" fill="none" stroke="#222" stroke-width="3"/>
          <path d="M0 145 Q40 140 50 155" fill="none" stroke="#222" stroke-width="2"/>
        </g>
      `,
      tree: `
        <!-- 나무 -->
        <g transform="translate(400, 500)">
          <!-- 나뭇잎 (구름 모양) -->
          <circle cx="-60" cy="-180" r="50" fill="none" stroke="#222" stroke-width="3"/>
          <circle cx="0" cy="-200" r="60" fill="none" stroke="#222" stroke-width="3"/>
          <circle cx="60" cy="-180" r="50" fill="none" stroke="#222" stroke-width="3"/>
          <circle cx="-40" cy="-130" r="45" fill="none" stroke="#222" stroke-width="3"/>
          <circle cx="40" cy="-130" r="45" fill="none" stroke="#222" stroke-width="3"/>
          <circle cx="0" cy="-140" r="55" fill="none" stroke="#222" stroke-width="3"/>

          <!-- 줄기 -->
          <path d="M-30 -90 L-40 80 L40 80 L30 -90" fill="none" stroke="#222" stroke-width="3"/>

          <!-- 나무 무늬 -->
          <path d="M-10 -60 Q0 -40 -5 -20" fill="none" stroke="#222" stroke-width="2"/>
          <path d="M10 -30 Q20 -10 15 10" fill="none" stroke="#222" stroke-width="2"/>

          <!-- 뿌리 -->
          <path d="M-40 80 Q-60 90 -70 80" fill="none" stroke="#222" stroke-width="3"/>
          <path d="M40 80 Q60 90 70 80" fill="none" stroke="#222" stroke-width="3"/>

          <!-- 사과/열매 -->
          <circle cx="-30" cy="-160" r="12" fill="none" stroke="#222" stroke-width="2"/>
          <circle cx="45" cy="-150" r="12" fill="none" stroke="#222" stroke-width="2"/>
          <circle cx="10" cy="-170" r="12" fill="none" stroke="#222" stroke-width="2"/>
        </g>
      `
    },
    VEHICLES: {
      car: `
        <!-- 자동차 -->
        <g transform="translate(400, 450)">
          <!-- 차체 -->
          <path d="M-150 0 L-130 0 L-100 -60 L100 -60 L130 0 L150 0 L150 40 L-150 40 Z"
                fill="none" stroke="#222" stroke-width="3"/>

          <!-- 지붕/창문 -->
          <path d="M-90 -60 L-70 -110 L70 -110 L90 -60" fill="none" stroke="#222" stroke-width="3"/>
          <line x1="0" y1="-60" x2="0" y2="-110" stroke="#222" stroke-width="2"/>

          <!-- 앞 유리 -->
          <path d="M-85 -65 L-68 -105 L-5 -105 L-5 -65" fill="none" stroke="#222" stroke-width="2"/>
          <!-- 뒷 유리 -->
          <path d="M85 -65 L68 -105 L5 -105 L5 -65" fill="none" stroke="#222" stroke-width="2"/>

          <!-- 바퀴 -->
          <circle cx="-90" cy="40" r="35" fill="none" stroke="#222" stroke-width="3"/>
          <circle cx="-90" cy="40" r="20" fill="none" stroke="#222" stroke-width="2"/>
          <circle cx="-90" cy="40" r="8" fill="#222"/>

          <circle cx="90" cy="40" r="35" fill="none" stroke="#222" stroke-width="3"/>
          <circle cx="90" cy="40" r="20" fill="none" stroke="#222" stroke-width="2"/>
          <circle cx="90" cy="40" r="8" fill="#222"/>

          <!-- 헤드라이트 -->
          <ellipse cx="-140" cy="10" rx="12" ry="15" fill="none" stroke="#222" stroke-width="2"/>
          <ellipse cx="140" cy="10" rx="12" ry="15" fill="none" stroke="#222" stroke-width="2"/>

          <!-- 문 손잡이 -->
          <rect x="-50" y="-20" width="20" height="8" rx="3" fill="none" stroke="#222" stroke-width="2"/>
          <rect x="30" y="-20" width="20" height="8" rx="3" fill="none" stroke="#222" stroke-width="2"/>

          <!-- 사이드 미러 -->
          <ellipse cx="-115" cy="-50" rx="12" ry="8" fill="none" stroke="#222" stroke-width="2"/>
          <ellipse cx="115" cy="-50" rx="12" ry="8" fill="none" stroke="#222" stroke-width="2"/>
        </g>
      `,
      airplane: `
        <!-- 비행기 -->
        <g transform="translate(400, 420)">
          <!-- 동체 -->
          <ellipse cx="0" cy="0" rx="140" ry="35" fill="none" stroke="#222" stroke-width="3"/>

          <!-- 조종석 -->
          <path d="M120 -20 Q150 -15 160 0 Q150 15 120 20" fill="none" stroke="#222" stroke-width="2"/>
          <ellipse cx="135" cy="0" rx="20" ry="15" fill="none" stroke="#222" stroke-width="2"/>

          <!-- 날개 -->
          <path d="M-20 -30 L-60 -120 L40 -120 L20 -30" fill="none" stroke="#222" stroke-width="3"/>
          <path d="M-20 30 L-60 120 L40 120 L20 30" fill="none" stroke="#222" stroke-width="3"/>

          <!-- 꼬리 날개 -->
          <path d="M-130 -30 L-150 -80 L-100 -80 L-100 -30" fill="none" stroke="#222" stroke-width="3"/>
          <path d="M-130 30 L-150 60 L-100 60 L-100 30" fill="none" stroke="#222" stroke-width="3"/>

          <!-- 수직 꼬리 -->
          <path d="M-140 -35 L-160 -100 L-120 -100 L-120 -35" fill="none" stroke="#222" stroke-width="3"/>

          <!-- 창문 -->
          <circle cx="80" cy="0" r="8" fill="none" stroke="#222" stroke-width="2"/>
          <circle cx="55" cy="0" r="8" fill="none" stroke="#222" stroke-width="2"/>
          <circle cx="30" cy="0" r="8" fill="none" stroke="#222" stroke-width="2"/>
          <circle cx="5" cy="0" r="8" fill="none" stroke="#222" stroke-width="2"/>

          <!-- 엔진 -->
          <ellipse cx="-10" cy="-70" rx="20" ry="12" fill="none" stroke="#222" stroke-width="2"/>
          <ellipse cx="-10" cy="70" rx="20" ry="12" fill="none" stroke="#222" stroke-width="2"/>
        </g>
      `
    },
    FOOD: {
      apple: `
        <!-- 사과 -->
        <g transform="translate(400, 420)">
          <!-- 사과 본체 -->
          <path d="M0 -60
                   Q-80 -40 -100 40
                   Q-90 120 0 140
                   Q90 120 100 40
                   Q80 -40 0 -60"
                fill="none" stroke="#222" stroke-width="3"/>

          <!-- 위쪽 홈 -->
          <path d="M-20 -55 Q0 -70 20 -55" fill="none" stroke="#222" stroke-width="2"/>

          <!-- 줄기 -->
          <path d="M0 -60 Q5 -90 -5 -100" fill="none" stroke="#222" stroke-width="3"/>

          <!-- 잎 -->
          <path d="M0 -80 Q30 -100 50 -80 Q30 -70 0 -80" fill="none" stroke="#222" stroke-width="2"/>
          <path d="M10 -80 Q25 -85 35 -80" fill="none" stroke="#222" stroke-width="1.5"/>

          <!-- 하이라이트 -->
          <ellipse cx="-40" cy="-10" rx="20" ry="35" fill="none" stroke="#222" stroke-width="1.5" stroke-dasharray="5,5"/>
        </g>
      `,
      icecream: `
        <!-- 아이스크림 -->
        <g transform="translate(400, 380)">
          <!-- 아이스크림 볼 3개 -->
          <circle cx="0" cy="-80" r="55" fill="none" stroke="#222" stroke-width="3"/>
          <circle cx="-45" cy="-20" r="50" fill="none" stroke="#222" stroke-width="3"/>
          <circle cx="45" cy="-20" r="50" fill="none" stroke="#222" stroke-width="3"/>

          <!-- 초코칩/토핑 -->
          <ellipse cx="-15" cy="-90" rx="8" ry="5" fill="#222"/>
          <ellipse cx="20" cy="-70" rx="8" ry="5" fill="#222"/>
          <ellipse cx="-50" cy="-30" rx="6" ry="4" fill="#222"/>
          <ellipse cx="55" cy="-10" rx="6" ry="4" fill="#222"/>

          <!-- 콘 -->
          <path d="M-60 30 L0 180 L60 30" fill="none" stroke="#222" stroke-width="3"/>

          <!-- 콘 무늬 -->
          <line x1="-50" y1="45" x2="50" y2="45" stroke="#222" stroke-width="2"/>
          <line x1="-40" y1="70" x2="40" y2="70" stroke="#222" stroke-width="2"/>
          <line x1="-30" y1="95" x2="30" y2="95" stroke="#222" stroke-width="2"/>
          <line x1="-20" y1="120" x2="20" y2="120" stroke="#222" stroke-width="2"/>

          <!-- 대각선 무늬 -->
          <line x1="-55" y1="35" x2="-15" y2="130" stroke="#222" stroke-width="1.5"/>
          <line x1="-35" y1="35" x2="5" y2="130" stroke="#222" stroke-width="1.5"/>
          <line x1="-15" y1="35" x2="15" y2="110" stroke="#222" stroke-width="1.5"/>
          <line x1="15" y1="35" x2="-5" y2="130" stroke="#222" stroke-width="1.5"/>
          <line x1="35" y1="35" x2="15" y2="110" stroke="#222" stroke-width="1.5"/>
          <line x1="55" y1="35" x2="20" y2="120" stroke="#222" stroke-width="1.5"/>
        </g>
      `
    },
    SPACE: {
      rocket: `
        <!-- 로켓 -->
        <g transform="translate(400, 450)">
          <!-- 로켓 본체 -->
          <path d="M0 -180
                   Q40 -150 40 -60
                   L40 80
                   L-40 80
                   L-40 -60
                   Q-40 -150 0 -180"
                fill="none" stroke="#222" stroke-width="3"/>

          <!-- 창문 -->
          <circle cx="0" cy="-80" r="25" fill="none" stroke="#222" stroke-width="3"/>
          <circle cx="0" cy="-80" r="15" fill="none" stroke="#222" stroke-width="2"/>

          <!-- 작은 창문 -->
          <circle cx="0" cy="-20" r="15" fill="none" stroke="#222" stroke-width="2"/>
          <circle cx="0" cy="30" r="15" fill="none" stroke="#222" stroke-width="2"/>

          <!-- 날개 -->
          <path d="M-40 20 L-90 100 L-90 80 L-40 60" fill="none" stroke="#222" stroke-width="3"/>
          <path d="M40 20 L90 100 L90 80 L40 60" fill="none" stroke="#222" stroke-width="3"/>

          <!-- 하단 날개 -->
          <path d="M-40 80 L-60 130 L-40 110" fill="none" stroke="#222" stroke-width="3"/>
          <path d="M40 80 L60 130 L40 110" fill="none" stroke="#222" stroke-width="3"/>

          <!-- 불꽃 -->
          <path d="M-25 80 Q-30 120 -15 160 Q0 130 15 160 Q30 120 25 80"
                fill="none" stroke="#222" stroke-width="2"/>
          <path d="M-15 90 Q-10 115 0 140 Q10 115 15 90"
                fill="none" stroke="#222" stroke-width="2"/>

          <!-- 별들 -->
          <polygon points="-120,-100 -115,-85 -100,-85 -112,-75 -108,-60 -120,-70 -132,-60 -128,-75 -140,-85 -125,-85"
                   fill="none" stroke="#222" stroke-width="1.5"/>
          <polygon points="120,-120 123,-110 135,-110 126,-103 129,-93 120,-100 111,-93 114,-103 105,-110 117,-110"
                   fill="none" stroke="#222" stroke-width="1.5"/>
          <circle cx="-80" cy="-150" r="5" fill="none" stroke="#222" stroke-width="1.5"/>
          <circle cx="100" cy="-50" r="4" fill="none" stroke="#222" stroke-width="1.5"/>
        </g>
      `
    },
    OCEAN: {
      fish: `
        <!-- 물고기 -->
        <g transform="translate(400, 420)">
          <!-- 몸통 -->
          <ellipse cx="0" cy="0" rx="100" ry="55" fill="none" stroke="#222" stroke-width="3"/>

          <!-- 꼬리 -->
          <path d="M90 0 L150 -50 L150 50 Z" fill="none" stroke="#222" stroke-width="3"/>

          <!-- 등지느러미 -->
          <path d="M-30 -55 Q-10 -100 30 -100 Q50 -100 40 -55" fill="none" stroke="#222" stroke-width="3"/>
          <line x1="-10" y1="-60" x2="0" y2="-90" stroke="#222" stroke-width="2"/>
          <line x1="10" y1="-58" x2="20" y2="-85" stroke="#222" stroke-width="2"/>
          <line x1="30" y1="-56" x2="35" y2="-75" stroke="#222" stroke-width="2"/>

          <!-- 배지느러미 -->
          <path d="M-20 55 Q0 90 20 55" fill="none" stroke="#222" stroke-width="3"/>

          <!-- 가슴지느러미 -->
          <path d="M-50 20 Q-80 40 -70 70 Q-50 50 -40 25" fill="none" stroke="#222" stroke-width="2"/>

          <!-- 눈 -->
          <circle cx="-55" cy="-10" r="18" fill="none" stroke="#222" stroke-width="2"/>
          <circle cx="-52" cy="-8" r="8" fill="#222"/>

          <!-- 입 -->
          <path d="M-100 5 Q-90 10 -100 15" fill="none" stroke="#222" stroke-width="2"/>

          <!-- 비늘 패턴 -->
          <path d="M-30 -20 Q-10 -30 10 -20" fill="none" stroke="#222" stroke-width="1.5"/>
          <path d="M-20 0 Q0 -10 20 0" fill="none" stroke="#222" stroke-width="1.5"/>
          <path d="M-30 20 Q-10 10 10 20" fill="none" stroke="#222" stroke-width="1.5"/>
          <path d="M10 -10 Q30 -20 50 -10" fill="none" stroke="#222" stroke-width="1.5"/>
          <path d="M20 10 Q40 0 60 10" fill="none" stroke="#222" stroke-width="1.5"/>

          <!-- 물방울 -->
          <circle cx="-130" cy="-30" r="8" fill="none" stroke="#222" stroke-width="1.5"/>
          <circle cx="-140" cy="-60" r="5" fill="none" stroke="#222" stroke-width="1.5"/>
          <circle cx="-120" cy="-80" r="6" fill="none" stroke="#222" stroke-width="1.5"/>
        </g>
      `,
      whale: `
        <!-- 고래 -->
        <g transform="translate(400, 420)">
          <!-- 몸통 -->
          <path d="M-120 0
                   Q-150 -40 -100 -60
                   Q0 -80 100 -40
                   Q140 -20 130 20
                   Q100 60 0 50
                   Q-100 40 -120 0"
                fill="none" stroke="#222" stroke-width="3"/>

          <!-- 꼬리 -->
          <path d="M-110 0 Q-160 -30 -180 -60" fill="none" stroke="#222" stroke-width="3"/>
          <path d="M-110 0 Q-160 30 -180 60" fill="none" stroke="#222" stroke-width="3"/>
          <path d="M-180 -60 Q-200 -40 -180 0 Q-200 40 -180 60" fill="none" stroke="#222" stroke-width="3"/>

          <!-- 지느러미 -->
          <path d="M20 50 Q40 100 80 90 Q60 70 40 50" fill="none" stroke="#222" stroke-width="2"/>

          <!-- 등지느러미 -->
          <path d="M-40 -60 Q-20 -100 20 -80 Q10 -70 -20 -55" fill="none" stroke="#222" stroke-width="2"/>

          <!-- 눈 -->
          <circle cx="80" cy="-10" r="12" fill="none" stroke="#222" stroke-width="2"/>
          <circle cx="83" cy="-8" r="5" fill="#222"/>

          <!-- 입 -->
          <path d="M120 10 Q130 20 120 30" fill="none" stroke="#222" stroke-width="2"/>

          <!-- 물줄기 -->
          <path d="M-60 -70 Q-70 -120 -80 -140" fill="none" stroke="#222" stroke-width="2"/>
          <path d="M-60 -70 Q-60 -120 -60 -150" fill="none" stroke="#222" stroke-width="2"/>
          <path d="M-60 -70 Q-50 -120 -40 -140" fill="none" stroke="#222" stroke-width="2"/>

          <!-- 물방울 -->
          <ellipse cx="-85" cy="-150" rx="8" ry="12" fill="none" stroke="#222" stroke-width="1.5"/>
          <ellipse cx="-60" cy="-160" rx="10" ry="14" fill="none" stroke="#222" stroke-width="1.5"/>
          <ellipse cx="-35" cy="-148" rx="7" ry="10" fill="none" stroke="#222" stroke-width="1.5"/>

          <!-- 배 무늬 -->
          <path d="M-60 25 Q0 35 60 20" fill="none" stroke="#222" stroke-width="1.5"/>
        </g>
      `
    },
    FANTASY: {
      unicorn: `
        <!-- 유니콘 -->
        <g transform="translate(400, 450)">
          <!-- 몸통 -->
          <ellipse cx="0" cy="30" rx="100" ry="60" fill="none" stroke="#222" stroke-width="3"/>

          <!-- 목 -->
          <path d="M70 -10 Q90 -50 70 -90" fill="none" stroke="#222" stroke-width="3"/>
          <path d="M50 0 Q60 -40 50 -80" fill="none" stroke="#222" stroke-width="3"/>

          <!-- 머리 -->
          <ellipse cx="80" cy="-100" rx="45" ry="35" fill="none" stroke="#222" stroke-width="3"/>

          <!-- 뿔 (나선형) -->
          <path d="M85 -135 L90 -200" fill="none" stroke="#222" stroke-width="3"/>
          <path d="M80 -145 Q90 -150 85 -160" fill="none" stroke="#222" stroke-width="1.5"/>
          <path d="M80 -160 Q90 -165 85 -175" fill="none" stroke="#222" stroke-width="1.5"/>
          <path d="M80 -175 Q90 -180 87 -190" fill="none" stroke="#222" stroke-width="1.5"/>

          <!-- 귀 -->
          <path d="M55 -130 Q45 -160 60 -145" fill="none" stroke="#222" stroke-width="2"/>
          <path d="M105 -125 Q115 -155 100 -140" fill="none" stroke="#222" stroke-width="2"/>

          <!-- 눈 -->
          <ellipse cx="100" cy="-100" rx="10" ry="12" fill="none" stroke="#222" stroke-width="2"/>
          <ellipse cx="102" cy="-98" rx="4" ry="5" fill="#222"/>
          <!-- 속눈썹 -->
          <path d="M95 -112 Q100 -118 105 -112" fill="none" stroke="#222" stroke-width="1.5"/>

          <!-- 콧구멍 -->
          <ellipse cx="120" cy="-90" rx="4" ry="3" fill="#222"/>

          <!-- 갈기 -->
          <path d="M50 -80 Q30 -100 45 -120 Q60 -100 55 -80" fill="none" stroke="#222" stroke-width="2"/>
          <path d="M45 -70 Q20 -85 35 -105 Q55 -90 50 -70" fill="none" stroke="#222" stroke-width="2"/>
          <path d="M40 -50 Q10 -60 25 -85 Q50 -75 45 -50" fill="none" stroke="#222" stroke-width="2"/>
          <path d="M55 -20 Q25 -25 30 -50 Q50 -40 55 -20" fill="none" stroke="#222" stroke-width="2"/>

          <!-- 다리 -->
          <rect x="-60" y="80" width="25" height="70" rx="10" fill="none" stroke="#222" stroke-width="3"/>
          <rect x="-25" y="80" width="25" height="70" rx="10" fill="none" stroke="#222" stroke-width="3"/>
          <rect x="15" y="80" width="25" height="70" rx="10" fill="none" stroke="#222" stroke-width="3"/>
          <rect x="50" y="80" width="25" height="70" rx="10" fill="none" stroke="#222" stroke-width="3"/>

          <!-- 꼬리 -->
          <path d="M-100 20 Q-140 0 -130 -40 Q-120 -20 -110 -30 Q-100 -10 -100 20" fill="none" stroke="#222" stroke-width="2"/>
          <path d="M-100 30 Q-150 20 -140 -20" fill="none" stroke="#222" stroke-width="2"/>
          <path d="M-100 40 Q-160 40 -145 0" fill="none" stroke="#222" stroke-width="2"/>

          <!-- 별 장식 -->
          <polygon points="-130,-80 -127,-70 -117,-70 -125,-63 -122,-53 -130,-60 -138,-53 -135,-63 -143,-70 -133,-70"
                   fill="none" stroke="#222" stroke-width="1.5"/>
          <circle cx="130" cy="-140" r="4" fill="none" stroke="#222" stroke-width="1.5"/>
          <circle cx="145" cy="-120" r="3" fill="none" stroke="#222" stroke-width="1.5"/>
        </g>
      `
    }
  };

  // 테마에 맞는 템플릿 선택
  const themeTemplates = svgTemplates[theme];
  let selectedTemplate = '';

  if (themeTemplates) {
    const templateKeys = Object.keys(themeTemplates);
    const randomKey = templateKeys[Math.floor(Math.random() * templateKeys.length)];
    selectedTemplate = themeTemplates[randomKey];
  } else {
    // 기본 템플릿 (동물 - 고양이)
    selectedTemplate = svgTemplates.ANIMALS.cat;
  }

  // 추가 설명이 있으면 제목에 반영
  const titleText = additionalDetails
    ? `${themeInfo.ko} - ${additionalDetails.substring(0, 20)}${additionalDetails.length > 20 ? '...' : ''}`
    : `${themeInfo.ko} ${techniqueLabel[technique] || '색칠하기'}`;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
  <!-- 배경 -->
  <rect width="800" height="1000" fill="white"/>

  <!-- 테두리 -->
  <rect x="25" y="25" width="750" height="950" fill="none" stroke="#333" stroke-width="2" rx="15"/>

  <!-- 제목 영역 -->
  <rect x="40" y="40" width="720" height="60" fill="#f8f9fa" rx="10"/>
  <text x="400" y="80" font-family="Arial, sans-serif" font-size="26" fill="#222" text-anchor="middle" font-weight="bold">
    ${titleText}
  </text>

  <!-- 메인 도안 영역 -->
  ${selectedTemplate}

  <!-- 하단 안내 -->
  <rect x="40" y="870" width="720" height="105" fill="#fafafa" rx="10" stroke="#eee" stroke-width="1"/>
  <text x="60" y="900" font-family="Arial, sans-serif" font-size="14" fill="#444" font-weight="bold">활동 안내</text>
  <text x="60" y="925" font-family="Arial, sans-serif" font-size="12" fill="#666">• 선 안쪽을 예쁜 색으로 색칠해 보세요</text>
  <text x="60" y="945" font-family="Arial, sans-serif" font-size="12" fill="#666">• 색연필, 크레파스, 사인펜 등을 자유롭게 사용하세요</text>
  <text x="60" y="965" font-family="Arial, sans-serif" font-size="12" fill="#666">• 나만의 배경도 그려보세요!</text>

  <!-- 푸터 -->
  <text x="400" y="990" font-family="Arial, sans-serif" font-size="9" fill="#aaa" text-anchor="middle">
    ArtSheet Pro - AI 미술 도안
  </text>
</svg>`;

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

// 상세 이미지 생성 프롬프트 빌더
function buildDetailedPrompt(options: GenerateOptions): string {
  const themeInfo = themeTranslations[options.theme] || themeTranslations.ANIMALS;
  const ageInfo = ageComplexityGuide[options.ageGroup] || ageComplexityGuide.ALL;
  const techniqueBuilder = techniquePrompts[options.technique] || techniquePrompts.COLORING;

  // 주제 선택
  const subjectIndex = Math.floor(Math.random() * themeInfo.subjects.length);
  const baseSubject = options.subTheme || themeInfo.subjects[subjectIndex];

  // 추가 설명 통합
  const fullSubject = options.additionalDetails
    ? `${baseSubject}, ${options.additionalDetails}`
    : baseSubject;

  // 기법별 프롬프트 생성
  const prompt = techniqueBuilder(fullSubject, options.additionalDetails || '');

  // 연령대 및 난이도 추가
  const finalPrompt = `${prompt}

AGE GROUP REQUIREMENTS:
- Complexity: ${ageInfo.complexity}
- Line Weight: ${ageInfo.lineWeight}
- Details: ${ageInfo.details}

DIFFICULTY: ${options.difficulty}/5

CRITICAL - IMAGE QUALITY RULES:
1. Body parts must be properly connected and proportioned
2. No overlapping elements unless intentional
3. Clear separation between all areas
4. Anatomically correct (head on neck, limbs attached properly)
5. Professional illustration quality
6. Ready for printing at 300 DPI`;

  return finalPrompt;
}

// Gemini 이미지 생성
async function generateWithGemini(prompt: string): Promise<string | null> {
  try {
    console.log('Attempting Gemini 2.0 Flash image generation...');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            responseModalities: ['IMAGE'],
            temperature: 0.8,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();

    const candidates = data.candidates || [];
    for (const candidate of candidates) {
      const parts = candidate.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          const { mimeType, data: imageData } = part.inlineData;
          console.log('Image generated successfully');
          return `data:${mimeType};base64,${imageData}`;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Gemini generation failed:', error);
    return null;
  }
}

// Imagen 3 생성
async function generateWithImagen3(prompt: string): Promise<string | null> {
  try {
    console.log('Attempting Imagen 3 generation...');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: '3:4',
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Imagen 3 API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();

    if (data.predictions && data.predictions.length > 0) {
      const imageBytes = data.predictions[0].bytesBase64Encoded;
      if (imageBytes) {
        console.log('Imagen 3 image generated successfully');
        return `data:image/png;base64,${imageBytes}`;
      }
    }

    return null;
  } catch (error) {
    console.error('Imagen 3 generation failed:', error);
    return null;
  }
}

// 설명 생성
async function generateDescription(options: PromptOptions): Promise<string> {
  try {
    const themeInfo = themeTranslations[options.theme] || themeTranslations.ANIMALS;

    const prompt = `당신은 어린이 미술 교육 전문가입니다.
다음 조건에 맞는 미술 도안에 대한 간단한 활동 설명(2-3문장)을 한국어로 작성해주세요:
- 기법: ${options.technique}
- 주제: ${themeInfo.ko}
- 세부 주제: ${options.subTheme || '일반'}
- 연령대: ${options.ageGroup}
- 난이도: ${options.difficulty}/5
${options.additionalDetails ? `- 사용자 요청: ${options.additionalDetails}` : ''}

활동의 교육적 가치와 아이들이 즐길 수 있는 포인트를 포함해주세요.`;

    const result = await geminiTextModel.generateContent(prompt);
    return result.response.text() || '';
  } catch (error) {
    console.error('Failed to generate description:', error);
    const themeInfo = themeTranslations[options.theme] || themeTranslations.ANIMALS;
    return `${themeInfo.ko} 주제의 색칠 도안입니다. 다양한 색을 사용하여 자유롭게 색칠해 보세요.`;
  }
}

// 메인 생성 함수
export async function generateArtSheets(options: GenerateOptions): Promise<GeneratedSheet[]> {
  const count = options.count || 1;
  const results: GeneratedSheet[] = [];

  console.log('Starting art sheet generation with options:', {
    technique: options.technique,
    theme: options.theme,
    subTheme: options.subTheme,
    ageGroup: options.ageGroup,
    difficulty: options.difficulty,
    additionalDetails: options.additionalDetails
  });

  // 상세 프롬프트 생성
  const imagePrompt = buildDetailedPrompt(options);
  console.log('Generated prompt length:', imagePrompt.length);

  // 설명 생성
  let description = '';
  try {
    description = await generateDescription(options);
  } catch (e) {
    console.error('Description generation failed:', e);
    const themeInfo = themeTranslations[options.theme] || themeTranslations.ANIMALS;
    description = `${themeInfo.ko} 주제의 미술 도안입니다.`;
  }

  // 이미지 생성
  for (let i = 0; i < count; i++) {
    let imageUrl: string | null = null;
    let modelVersion = 'svg-template-v2';

    console.log(`Generating image ${i + 1}/${count}...`);

    // Gemini 시도
    try {
      imageUrl = await generateWithGemini(imagePrompt);
      if (imageUrl) {
        modelVersion = 'gemini-2.0-flash-exp';
        console.log('Successfully generated with Gemini');
      }
    } catch (e) {
      console.error('Gemini error:', e);
    }

    // Imagen 3 폴백
    if (!imageUrl) {
      try {
        imageUrl = await generateWithImagen3(imagePrompt);
        if (imageUrl) {
          modelVersion = 'imagen-3.0-generate-002';
          console.log('Successfully generated with Imagen 3');
        }
      } catch (e) {
        console.error('Imagen 3 error:', e);
      }
    }

    // 고품질 SVG 폴백
    if (!imageUrl) {
      console.log('Using high-quality SVG template');
      imageUrl = generateHighQualitySVG(
        options.technique,
        options.theme,
        options.subTheme || '',
        options.additionalDetails || '',
        options.ageGroup,
        options.difficulty
      );
    }

    results.push({
      imageUrl,
      thumbnailUrl: imageUrl,
      prompt: imagePrompt,
      cached: false,
      metadata: {
        technique: options.technique,
        theme: options.theme,
        subTheme: options.subTheme || '',
        ageGroup: options.ageGroup,
        difficulty: options.difficulty,
        generatedAt: new Date().toISOString(),
        modelVersion
      }
    });
  }

  console.log(`Generated ${results.length} sheets`);
  return results;
}

// 배치 생성
export async function generateBatchSheets(
  requests: GenerateOptions[]
): Promise<Map<string, GeneratedSheet[]>> {
  const results = new Map<string, GeneratedSheet[]>();

  for (const req of requests) {
    try {
      const sheets = await generateArtSheets(req);
      const key = `${req.technique}_${req.theme}_${req.subTheme}`;
      results.set(key, sheets);
    } catch (error) {
      console.error('Batch generation error:', error);
    }
  }

  return results;
}
