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

// ============================================
// 테마별 SVG 도안 라이브러리
// ============================================

interface SVGTemplate {
  name: string;
  nameKo: string;
  svg: string;
}

const animalTemplates: SVGTemplate[] = [
  {
    name: 'cat',
    nameKo: '고양이',
    svg: `<g transform="translate(400, 420)">
      <ellipse cx="0" cy="60" rx="85" ry="65" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="0" cy="-35" r="55" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-38 -80 L-50 -130 L-18 -90 Z" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M38 -80 L50 -130 L18 -90 Z" fill="none" stroke="#222" stroke-width="3"/>
      <ellipse cx="-20" cy="-40" rx="10" ry="14" fill="none" stroke="#222" stroke-width="2"/>
      <ellipse cx="20" cy="-40" rx="10" ry="14" fill="none" stroke="#222" stroke-width="2"/>
      <ellipse cx="-20" cy="-38" rx="4" ry="7" fill="#222"/>
      <ellipse cx="20" cy="-38" rx="4" ry="7" fill="#222"/>
      <path d="M0 -20 L-6 -10 L6 -10 Z" fill="#222"/>
      <path d="M0 -10 Q-12 2 -20 -2" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M0 -10 Q12 2 20 -2" fill="none" stroke="#222" stroke-width="2"/>
      <line x1="-22" y1="-18" x2="-55" y2="-22" stroke="#222" stroke-width="1.5"/>
      <line x1="-22" y1="-12" x2="-55" y2="-12" stroke="#222" stroke-width="1.5"/>
      <line x1="22" y1="-18" x2="55" y2="-22" stroke="#222" stroke-width="1.5"/>
      <line x1="22" y1="-12" x2="55" y2="-12" stroke="#222" stroke-width="1.5"/>
      <ellipse cx="-35" cy="125" rx="22" ry="16" fill="none" stroke="#222" stroke-width="3"/>
      <ellipse cx="35" cy="125" rx="22" ry="16" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M85 40 Q130 10 120 -40" fill="none" stroke="#222" stroke-width="3"/>
    </g>`
  },
  {
    name: 'dog',
    nameKo: '강아지',
    svg: `<g transform="translate(400, 400)">
      <ellipse cx="0" cy="70" rx="95" ry="60" fill="none" stroke="#222" stroke-width="3"/>
      <ellipse cx="0" cy="-20" rx="65" ry="55" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-55 -35 Q-90 -15 -80 50 Q-75 70 -50 60" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M55 -35 Q90 -15 80 50 Q75 70 50 60" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="-22" cy="-28" r="12" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="22" cy="-28" r="12" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="-20" cy="-26" r="5" fill="#222"/>
      <circle cx="24" cy="-26" r="5" fill="#222"/>
      <ellipse cx="0" cy="5" rx="18" ry="14" fill="#222"/>
      <path d="M0 19 Q0 35 -18 42" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M0 19 Q0 35 18 42" fill="none" stroke="#222" stroke-width="2"/>
      <ellipse cx="0" cy="50" rx="14" ry="20" fill="none" stroke="#222" stroke-width="2"/>
      <rect x="-65" y="115" width="28" height="55" rx="12" fill="none" stroke="#222" stroke-width="3"/>
      <rect x="-28" y="115" width="28" height="55" rx="12" fill="none" stroke="#222" stroke-width="3"/>
      <rect x="0" y="115" width="28" height="55" rx="12" fill="none" stroke="#222" stroke-width="3"/>
      <rect x="37" y="115" width="28" height="55" rx="12" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M95 50 Q125 30 115 -15 Q110 -35 125 -45" fill="none" stroke="#222" stroke-width="3"/>
    </g>`
  },
  {
    name: 'rabbit',
    nameKo: '토끼',
    svg: `<g transform="translate(400, 430)">
      <ellipse cx="0" cy="50" rx="75" ry="85" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="0" cy="-55" r="52" fill="none" stroke="#222" stroke-width="3"/>
      <ellipse cx="-28" cy="-145" rx="16" ry="62" fill="none" stroke="#222" stroke-width="3"/>
      <ellipse cx="28" cy="-145" rx="16" ry="62" fill="none" stroke="#222" stroke-width="3"/>
      <ellipse cx="-28" cy="-145" rx="8" ry="48" fill="none" stroke="#222" stroke-width="2"/>
      <ellipse cx="28" cy="-145" rx="8" ry="48" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="-18" cy="-60" r="10" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="18" cy="-60" r="10" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="-16" cy="-58" r="4" fill="#222"/>
      <circle cx="20" cy="-58" r="4" fill="#222"/>
      <ellipse cx="0" cy="-40" rx="9" ry="7" fill="#222"/>
      <path d="M0 -33 L0 -22" stroke="#222" stroke-width="2"/>
      <path d="M0 -22 Q-12 -16 -18 -28" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M0 -22 Q12 -16 18 -28" fill="none" stroke="#222" stroke-width="2"/>
      <ellipse cx="-32" cy="115" rx="20" ry="28" fill="none" stroke="#222" stroke-width="3"/>
      <ellipse cx="32" cy="115" rx="20" ry="28" fill="none" stroke="#222" stroke-width="3"/>
      <ellipse cx="-55" cy="135" rx="32" ry="20" fill="none" stroke="#222" stroke-width="3"/>
      <ellipse cx="55" cy="135" rx="32" ry="20" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="0" cy="135" r="22" fill="none" stroke="#222" stroke-width="3"/>
    </g>`
  },
  {
    name: 'elephant',
    nameKo: '코끼리',
    svg: `<g transform="translate(400, 420)">
      <ellipse cx="0" cy="50" rx="120" ry="80" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="-60" cy="-40" r="60" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-100 -20 Q-140 20 -130 80 Q-125 100 -110 95 Q-105 80 -100 60 Q-95 40 -85 30" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-120 -60 Q-160 -40 -155 20 Q-150 50 -130 40" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-20 -60 Q20 -40 15 20 Q10 50 -10 40" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="-75" cy="-50" r="8" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="-73" cy="-48" r="3" fill="#222"/>
      <rect x="-90" y="115" width="35" height="60" rx="15" fill="none" stroke="#222" stroke-width="3"/>
      <rect x="-45" y="115" width="35" height="60" rx="15" fill="none" stroke="#222" stroke-width="3"/>
      <rect x="10" y="115" width="35" height="60" rx="15" fill="none" stroke="#222" stroke-width="3"/>
      <rect x="55" y="115" width="35" height="60" rx="15" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M115 30 Q140 40 130 70" fill="none" stroke="#222" stroke-width="3"/>
    </g>`
  },
  {
    name: 'lion',
    nameKo: '사자',
    svg: `<g transform="translate(400, 420)">
      <ellipse cx="0" cy="70" rx="90" ry="60" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="0" cy="-30" r="90" fill="none" stroke="#222" stroke-width="2" stroke-dasharray="15,8"/>
      <circle cx="0" cy="-30" r="55" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-35 -70 L-42 -90 L-25 -75" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M35 -70 L42 -90 L25 -75" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="-20" cy="-38" r="10" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="20" cy="-38" r="10" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="-18" cy="-36" r="4" fill="#222"/>
      <circle cx="22" cy="-36" r="4" fill="#222"/>
      <ellipse cx="0" cy="-12" rx="12" ry="10" fill="#222"/>
      <path d="M0 -2 Q-15 12 -22 8" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M0 -2 Q15 12 22 8" fill="none" stroke="#222" stroke-width="2"/>
      <rect x="-60" y="115" width="30" height="55" rx="12" fill="none" stroke="#222" stroke-width="3"/>
      <rect x="-22" y="115" width="30" height="55" rx="12" fill="none" stroke="#222" stroke-width="3"/>
      <rect x="-8" y="115" width="30" height="55" rx="12" fill="none" stroke="#222" stroke-width="3"/>
      <rect x="30" y="115" width="30" height="55" rx="12" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M90 50 Q130 30 125 -10 Q130 -30 150 -20" fill="none" stroke="#222" stroke-width="3"/>
    </g>`
  },
  {
    name: 'butterfly',
    nameKo: '나비',
    svg: `<g transform="translate(400, 420)">
      <ellipse cx="0" cy="0" rx="12" ry="80" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="0" cy="-95" r="20" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="-8" cy="-100" r="5" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="8" cy="-100" r="5" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M-5 -115 Q-15 -150 -8 -160" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M5 -115 Q15 -150 8 -160" fill="none" stroke="#222" stroke-width="2"/>
      <ellipse cx="-85" cy="-40" rx="75" ry="55" fill="none" stroke="#222" stroke-width="3"/>
      <ellipse cx="85" cy="-40" rx="75" ry="55" fill="none" stroke="#222" stroke-width="3"/>
      <ellipse cx="-70" cy="50" rx="55" ry="45" fill="none" stroke="#222" stroke-width="3"/>
      <ellipse cx="70" cy="50" rx="55" ry="45" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="-90" cy="-45" r="20" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="90" cy="-45" r="20" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="-70" cy="45" r="15" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="70" cy="45" r="15" fill="none" stroke="#222" stroke-width="2"/>
    </g>`
  },
  {
    name: 'bird',
    nameKo: '새',
    svg: `<g transform="translate(400, 420)">
      <ellipse cx="0" cy="30" rx="70" ry="50" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="-30" cy="-30" r="40" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-70 -30 L-100 -35 L-70 -20" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="-42" cy="-35" r="8" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="-40" cy="-33" r="3" fill="#222"/>
      <path d="M-10 -55 Q5 -80 0 -90 Q-15 -75 -10 -55" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M70 20 Q130 -20 150 30 Q120 25 100 50 Q80 40 70 30" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M60 10 Q100 -40 130 10" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M-20 80 L-25 130 L-15 130 L-10 80" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M20 80 L15 130 L25 130 L30 80" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-30 130 L-35 145 L-5 145 L-10 130" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M10 130 L5 145 L35 145 L30 130" fill="none" stroke="#222" stroke-width="2"/>
    </g>`
  }
];

const natureTemplates: SVGTemplate[] = [
  {
    name: 'flower',
    nameKo: '꽃',
    svg: `<g transform="translate(400, 380)">
      <ellipse cx="0" cy="-90" rx="38" ry="58" fill="none" stroke="#222" stroke-width="3"/>
      <ellipse cx="70" cy="-30" rx="38" ry="58" fill="none" stroke="#222" stroke-width="3" transform="rotate(72 0 0)"/>
      <ellipse cx="45" cy="70" rx="38" ry="58" fill="none" stroke="#222" stroke-width="3" transform="rotate(144 0 0)"/>
      <ellipse cx="-45" cy="70" rx="38" ry="58" fill="none" stroke="#222" stroke-width="3" transform="rotate(216 0 0)"/>
      <ellipse cx="-70" cy="-30" rx="38" ry="58" fill="none" stroke="#222" stroke-width="3" transform="rotate(288 0 0)"/>
      <circle cx="0" cy="0" r="35" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="0" cy="0" r="18" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="-10" cy="-10" r="4" fill="#222"/>
      <circle cx="10" cy="-10" r="4" fill="#222"/>
      <circle cx="-10" cy="10" r="4" fill="#222"/>
      <circle cx="10" cy="10" r="4" fill="#222"/>
      <path d="M0 60 Q12 120 0 200" fill="none" stroke="#222" stroke-width="4"/>
      <path d="M0 110 Q-65 90 -85 130 Q-65 155 0 125" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M0 115 Q-45 105 -55 125" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M0 155 Q65 135 85 175 Q65 200 0 165" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M0 160 Q45 150 55 170" fill="none" stroke="#222" stroke-width="2"/>
    </g>`
  },
  {
    name: 'tree',
    nameKo: '나무',
    svg: `<g transform="translate(400, 480)">
      <circle cx="-65" cy="-200" r="55" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="0" cy="-220" r="65" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="65" cy="-200" r="55" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="-45" cy="-145" r="50" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="45" cy="-145" r="50" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="0" cy="-155" r="60" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-35 -100 L-45 90 L45 90 L35 -100" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-12 -70 Q0 -50 -8 -25" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M12 -40 Q22 -18 18 5" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M-45 90 Q-70 100 -80 90" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M45 90 Q70 100 80 90" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="-35" cy="-180" r="14" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="50" cy="-170" r="14" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="12" cy="-190" r="14" fill="none" stroke="#222" stroke-width="2"/>
    </g>`
  },
  {
    name: 'sun',
    nameKo: '태양',
    svg: `<g transform="translate(400, 420)">
      <circle cx="0" cy="0" r="70" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="0" cy="0" r="50" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="-20" cy="-15" r="8" fill="#222"/>
      <circle cx="20" cy="-15" r="8" fill="#222"/>
      <path d="M-25 20 Q0 45 25 20" fill="none" stroke="#222" stroke-width="3"/>
      <line x1="0" y1="-85" x2="0" y2="-130" stroke="#222" stroke-width="3"/>
      <line x1="0" y1="85" x2="0" y2="130" stroke="#222" stroke-width="3"/>
      <line x1="-85" y1="0" x2="-130" y2="0" stroke="#222" stroke-width="3"/>
      <line x1="85" y1="0" x2="130" y2="0" stroke="#222" stroke-width="3"/>
      <line x1="-60" y1="-60" x2="-95" y2="-95" stroke="#222" stroke-width="3"/>
      <line x1="60" y1="-60" x2="95" y2="-95" stroke="#222" stroke-width="3"/>
      <line x1="-60" y1="60" x2="-95" y2="95" stroke="#222" stroke-width="3"/>
      <line x1="60" y1="60" x2="95" y2="95" stroke="#222" stroke-width="3"/>
    </g>`
  },
  {
    name: 'rainbow',
    nameKo: '무지개',
    svg: `<g transform="translate(400, 500)">
      <path d="M-250 0 A250 250 0 0 1 250 0" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-210 0 A210 210 0 0 1 210 0" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-170 0 A170 170 0 0 1 170 0" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-130 0 A130 130 0 0 1 130 0" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-90 0 A90 90 0 0 1 90 0" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-50 0 A50 50 0 0 1 50 0" fill="none" stroke="#222" stroke-width="3"/>
      <ellipse cx="-280" cy="20" rx="50" ry="30" fill="none" stroke="#222" stroke-width="2"/>
      <ellipse cx="-250" cy="35" rx="40" ry="25" fill="none" stroke="#222" stroke-width="2"/>
      <ellipse cx="280" cy="20" rx="50" ry="30" fill="none" stroke="#222" stroke-width="2"/>
      <ellipse cx="250" cy="35" rx="40" ry="25" fill="none" stroke="#222" stroke-width="2"/>
    </g>`
  }
];

const vehicleTemplates: SVGTemplate[] = [
  {
    name: 'car',
    nameKo: '자동차',
    svg: `<g transform="translate(400, 450)">
      <path d="M-160 0 L-140 0 L-110 -65 L110 -65 L140 0 L160 0 L160 45 L-160 45 Z" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-100 -65 L-78 -115 L78 -115 L100 -65" fill="none" stroke="#222" stroke-width="3"/>
      <line x1="0" y1="-65" x2="0" y2="-115" stroke="#222" stroke-width="2"/>
      <path d="M-95 -70 L-75 -110 L-8 -110 L-8 -70" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M95 -70 L75 -110 L8 -110 L8 -70" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="-100" cy="45" r="38" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="-100" cy="45" r="22" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="-100" cy="45" r="8" fill="#222"/>
      <circle cx="100" cy="45" r="38" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="100" cy="45" r="22" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="100" cy="45" r="8" fill="#222"/>
      <ellipse cx="-150" cy="12" rx="14" ry="18" fill="none" stroke="#222" stroke-width="2"/>
      <ellipse cx="150" cy="12" rx="14" ry="18" fill="none" stroke="#222" stroke-width="2"/>
      <rect x="-55" y="-22" width="22" height="10" rx="4" fill="none" stroke="#222" stroke-width="2"/>
      <rect x="33" y="-22" width="22" height="10" rx="4" fill="none" stroke="#222" stroke-width="2"/>
    </g>`
  },
  {
    name: 'airplane',
    nameKo: '비행기',
    svg: `<g transform="translate(400, 420)">
      <ellipse cx="0" cy="0" rx="150" ry="38" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M130 -22 Q162 -18 175 0 Q162 18 130 22" fill="none" stroke="#222" stroke-width="2"/>
      <ellipse cx="145" cy="0" rx="22" ry="16" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M-25 -32 L-68 -130 L45 -130 L22 -32" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-25 32 L-68 130 L45 130 L22 32" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-140 -32 L-162 -88 L-108 -88 L-108 -32" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-140 32 L-162 68 L-108 68 L-108 32" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-150 -38 L-172 -108 L-128 -108 L-128 -38" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="88" cy="0" r="9" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="60" cy="0" r="9" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="32" cy="0" r="9" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="4" cy="0" r="9" fill="none" stroke="#222" stroke-width="2"/>
      <ellipse cx="-12" cy="-78" rx="22" ry="14" fill="none" stroke="#222" stroke-width="2"/>
      <ellipse cx="-12" cy="78" rx="22" ry="14" fill="none" stroke="#222" stroke-width="2"/>
    </g>`
  },
  {
    name: 'train',
    nameKo: '기차',
    svg: `<g transform="translate(400, 450)">
      <rect x="-150" y="-100" width="180" height="120" rx="10" fill="none" stroke="#222" stroke-width="3"/>
      <rect x="40" y="-80" width="120" height="100" rx="8" fill="none" stroke="#222" stroke-width="3"/>
      <rect x="-130" y="-80" width="50" height="40" rx="5" fill="none" stroke="#222" stroke-width="2"/>
      <rect x="-70" y="-80" width="50" height="40" rx="5" fill="none" stroke="#222" stroke-width="2"/>
      <rect x="55" y="-65" width="40" height="35" rx="4" fill="none" stroke="#222" stroke-width="2"/>
      <rect x="105" y="-65" width="40" height="35" rx="4" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="-120" cy="35" r="28" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="-120" cy="35" r="15" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="-50" cy="35" r="28" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="-50" cy="35" r="15" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="70" cy="35" r="28" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="130" cy="35" r="28" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-90 -120 Q-100 -150 -85 -160" fill="none" stroke="#222" stroke-width="3"/>
      <ellipse cx="-85" cy="-170" rx="15" ry="12" fill="none" stroke="#222" stroke-width="2"/>
    </g>`
  },
  {
    name: 'bus',
    nameKo: '버스',
    svg: `<g transform="translate(400, 440)">
      <rect x="-160" y="-90" width="320" height="130" rx="15" fill="none" stroke="#222" stroke-width="3"/>
      <rect x="-145" y="-75" width="55" height="45" rx="5" fill="none" stroke="#222" stroke-width="2"/>
      <rect x="-80" y="-75" width="55" height="45" rx="5" fill="none" stroke="#222" stroke-width="2"/>
      <rect x="-15" y="-75" width="55" height="45" rx="5" fill="none" stroke="#222" stroke-width="2"/>
      <rect x="50" y="-75" width="55" height="45" rx="5" fill="none" stroke="#222" stroke-width="2"/>
      <rect x="115" y="-75" width="35" height="45" rx="5" fill="none" stroke="#222" stroke-width="2"/>
      <rect x="-145" y="-15" width="40" height="50" rx="5" fill="none" stroke="#222" stroke-width="2"/>
      <line x1="-160" y1="0" x2="160" y2="0" stroke="#222" stroke-width="2"/>
      <circle cx="-110" cy="55" r="30" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="-110" cy="55" r="15" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="110" cy="55" r="30" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="110" cy="55" r="15" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="150" cy="-55" r="12" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="-150" cy="-55" r="12" fill="none" stroke="#222" stroke-width="2"/>
    </g>`
  }
];

const foodTemplates: SVGTemplate[] = [
  {
    name: 'apple',
    nameKo: '사과',
    svg: `<g transform="translate(400, 400)">
      <path d="M0 -55 Q-85 -35 -105 45 Q-95 130 0 155 Q95 130 105 45 Q85 -35 0 -55" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-22 -50 Q0 -68 22 -50" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M0 -55 Q8 -90 -5 -105" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M0 -78 Q35 -100 55 -78 Q35 -68 0 -78" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M12 -78 Q28 -85 38 -78" fill="none" stroke="#222" stroke-width="1.5"/>
      <ellipse cx="-42" cy="0" rx="22" ry="38" fill="none" stroke="#222" stroke-width="1.5" stroke-dasharray="6,6"/>
    </g>`
  },
  {
    name: 'icecream',
    nameKo: '아이스크림',
    svg: `<g transform="translate(400, 360)">
      <circle cx="0" cy="-75" r="60" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="-50" cy="-15" r="55" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="50" cy="-15" r="55" fill="none" stroke="#222" stroke-width="3"/>
      <ellipse cx="-18" cy="-85" rx="10" ry="6" fill="#222"/>
      <ellipse cx="22" cy="-65" rx="10" ry="6" fill="#222"/>
      <ellipse cx="-55" cy="-25" rx="8" ry="5" fill="#222"/>
      <ellipse cx="60" cy="-5" rx="8" ry="5" fill="#222"/>
      <path d="M-65 38 L0 200 L65 38" fill="none" stroke="#222" stroke-width="3"/>
      <line x1="-55" y1="55" x2="55" y2="55" stroke="#222" stroke-width="2"/>
      <line x1="-45" y1="82" x2="45" y2="82" stroke="#222" stroke-width="2"/>
      <line x1="-35" y1="109" x2="35" y2="109" stroke="#222" stroke-width="2"/>
      <line x1="-25" y1="136" x2="25" y2="136" stroke="#222" stroke-width="2"/>
      <line x1="-60" y1="45" x2="-18" y2="145" stroke="#222" stroke-width="1.5"/>
      <line x1="-38" y1="45" x2="8" y2="145" stroke="#222" stroke-width="1.5"/>
      <line x1="60" y1="45" x2="18" y2="145" stroke="#222" stroke-width="1.5"/>
      <line x1="38" y1="45" x2="-8" y2="145" stroke="#222" stroke-width="1.5"/>
    </g>`
  },
  {
    name: 'cake',
    nameKo: '케이크',
    svg: `<g transform="translate(400, 420)">
      <ellipse cx="0" cy="-80" rx="120" ry="25" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-120 -80 L-120 20 Q-120 45 0 45 Q120 45 120 20 L120 -80" fill="none" stroke="#222" stroke-width="3"/>
      <ellipse cx="0" cy="20" rx="120" ry="25" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M-100 -50 Q-80 -65 -60 -50" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M-40 -50 Q-20 -65 0 -50" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M20 -50 Q40 -65 60 -50" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M80 -50 Q100 -65 100 -50" fill="none" stroke="#222" stroke-width="2"/>
      <rect x="-8" y="-130" width="16" height="50" rx="3" fill="none" stroke="#222" stroke-width="2"/>
      <ellipse cx="0" cy="-135" rx="12" ry="18" fill="none" stroke="#222" stroke-width="2"/>
      <rect x="-58" y="-120" width="12" height="40" rx="3" fill="none" stroke="#222" stroke-width="2"/>
      <ellipse cx="-52" cy="-125" rx="10" ry="14" fill="none" stroke="#222" stroke-width="2"/>
      <rect x="46" y="-120" width="12" height="40" rx="3" fill="none" stroke="#222" stroke-width="2"/>
      <ellipse cx="52" cy="-125" rx="10" ry="14" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="-90" cy="-30" r="8" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="90" cy="-30" r="8" fill="none" stroke="#222" stroke-width="2"/>
    </g>`
  },
  {
    name: 'pizza',
    nameKo: '피자',
    svg: `<g transform="translate(400, 420)">
      <path d="M0 -120 L-130 100 A150 150 0 0 0 130 100 Z" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M0 -100 L-110 85 A130 130 0 0 0 110 85 Z" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="-40" cy="-20" r="20" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="30" cy="10" r="18" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="-20" cy="50" r="22" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="60" cy="55" r="16" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="-70" cy="40" r="14" fill="none" stroke="#222" stroke-width="2"/>
      <ellipse cx="15" cy="-50" rx="12" ry="8" fill="#222"/>
      <ellipse cx="-55" cy="70" rx="10" ry="7" fill="#222"/>
      <ellipse cx="80" cy="25" rx="8" ry="6" fill="#222"/>
    </g>`
  }
];

const spaceTemplates: SVGTemplate[] = [
  {
    name: 'rocket',
    nameKo: '로켓',
    svg: `<g transform="translate(400, 440)">
      <path d="M0 -190 Q45 -158 45 -65 L45 88 L-45 88 L-45 -65 Q-45 -158 0 -190" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="0" cy="-85" r="28" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="0" cy="-85" r="16" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="0" cy="-22" r="18" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="0" cy="35" r="18" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M-45 25 L-98 108 L-98 88 L-45 65" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M45 25 L98 108 L98 88 L45 65" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-45 88 L-68 140 L-45 118" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M45 88 L68 140 L45 118" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-28 88 Q-35 130 -18 172 Q0 140 18 172 Q35 130 28 88" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M-18 98 Q-12 125 0 150 Q12 125 18 98" fill="none" stroke="#222" stroke-width="2"/>
      <polygon points="-130,-108 -125,-92 -108,-92 -120,-80 -116,-64 -130,-75 -144,-64 -140,-80 -152,-92 -135,-92" fill="none" stroke="#222" stroke-width="1.5"/>
      <polygon points="130,-130 134,-118 148,-118 138,-108 142,-95 130,-105 118,-95 122,-108 112,-118 126,-118" fill="none" stroke="#222" stroke-width="1.5"/>
    </g>`
  },
  {
    name: 'planet',
    nameKo: '행성',
    svg: `<g transform="translate(400, 420)">
      <circle cx="0" cy="0" r="85" fill="none" stroke="#222" stroke-width="3"/>
      <ellipse cx="0" cy="0" rx="150" ry="40" fill="none" stroke="#222" stroke-width="3" transform="rotate(-20)"/>
      <path d="M-60 -40 Q-30 -50 0 -35" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M20 -55 Q50 -45 60 -20" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M-50 30 Q-20 45 20 35" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="-30" cy="5" r="15" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="45" cy="25" r="12" fill="none" stroke="#222" stroke-width="2"/>
      <polygon points="-150,100 -145,115 -130,115 -142,125 -138,140 -150,130 -162,140 -158,125 -170,115 -155,115" fill="none" stroke="#222" stroke-width="1.5"/>
      <polygon points="160,-90 163,-80 175,-80 166,-73 169,-63 160,-70 151,-63 154,-73 145,-80 157,-80" fill="none" stroke="#222" stroke-width="1.5"/>
      <circle cx="-120" cy="-100" r="6" fill="none" stroke="#222" stroke-width="1.5"/>
      <circle cx="130" cy="110" r="5" fill="none" stroke="#222" stroke-width="1.5"/>
    </g>`
  },
  {
    name: 'astronaut',
    nameKo: '우주인',
    svg: `<g transform="translate(400, 420)">
      <ellipse cx="0" cy="-70" rx="55" ry="65" fill="none" stroke="#222" stroke-width="3"/>
      <ellipse cx="0" cy="-75" rx="40" ry="48" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="-15" cy="-80" r="8" fill="#222"/>
      <circle cx="15" cy="-80" r="8" fill="#222"/>
      <path d="M-12 -55 Q0 -45 12 -55" fill="none" stroke="#222" stroke-width="2"/>
      <ellipse cx="0" cy="50" rx="70" ry="85" fill="none" stroke="#222" stroke-width="3"/>
      <rect x="-45" y="20" width="90" height="60" rx="8" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="-20" cy="50" r="8" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="20" cy="50" r="8" fill="none" stroke="#222" stroke-width="2"/>
      <rect x="-55" y="120" width="40" height="55" rx="15" fill="none" stroke="#222" stroke-width="3"/>
      <rect x="15" y="120" width="40" height="55" rx="15" fill="none" stroke="#222" stroke-width="3"/>
      <ellipse cx="-85" cy="30" rx="25" ry="35" fill="none" stroke="#222" stroke-width="3"/>
      <ellipse cx="85" cy="30" rx="25" ry="35" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="-85" cy="65" r="18" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="85" cy="65" r="18" fill="none" stroke="#222" stroke-width="2"/>
    </g>`
  }
];

const oceanTemplates: SVGTemplate[] = [
  {
    name: 'fish',
    nameKo: '물고기',
    svg: `<g transform="translate(400, 420)">
      <ellipse cx="0" cy="0" rx="110" ry="60" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M100 0 L165 -55 L165 55 Z" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-35 -60 Q-12 -108 35 -108 Q55 -108 45 -60" fill="none" stroke="#222" stroke-width="3"/>
      <line x1="-12" y1="-65" x2="0" y2="-98" stroke="#222" stroke-width="2"/>
      <line x1="12" y1="-62" x2="22" y2="-92" stroke="#222" stroke-width="2"/>
      <line x1="35" y1="-60" x2="40" y2="-82" stroke="#222" stroke-width="2"/>
      <path d="M-22 60 Q0 98 22 60" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-55 22 Q-88 45 -78 78 Q-55 55 -45 28" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="-60" cy="-12" r="20" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="-57" cy="-10" r="9" fill="#222"/>
      <path d="M-110 6 Q-98 12 -110 18" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M-35 -22 Q-12 -35 12 -22" fill="none" stroke="#222" stroke-width="1.5"/>
      <path d="M-22 0 Q0 -12 22 0" fill="none" stroke="#222" stroke-width="1.5"/>
      <path d="M-35 22 Q-12 12 12 22" fill="none" stroke="#222" stroke-width="1.5"/>
      <path d="M12 -12 Q35 -22 55 -12" fill="none" stroke="#222" stroke-width="1.5"/>
      <path d="M22 12 Q45 0 65 12" fill="none" stroke="#222" stroke-width="1.5"/>
      <circle cx="-140" cy="-35" r="10" fill="none" stroke="#222" stroke-width="1.5"/>
      <circle cx="-152" cy="-68" r="7" fill="none" stroke="#222" stroke-width="1.5"/>
      <circle cx="-130" cy="-88" r="8" fill="none" stroke="#222" stroke-width="1.5"/>
    </g>`
  },
  {
    name: 'whale',
    nameKo: '고래',
    svg: `<g transform="translate(400, 420)">
      <path d="M-130 0 Q-165 -45 -110 -68 Q0 -88 110 -45 Q152 -22 142 22 Q110 68 0 55 Q-110 45 -130 0" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-120 0 Q-175 -35 -198 -68" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-120 0 Q-175 35 -198 68" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-198 -68 Q-220 -45 -198 0 Q-220 45 -198 68" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M22 55 Q45 110 88 98 Q65 78 45 55" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M-45 -68 Q-22 -110 22 -88 Q12 -78 -22 -60" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="88" cy="-12" r="14" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="92" cy="-10" r="6" fill="#222"/>
      <path d="M132 12 Q142 22 132 35" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M-68 -78 Q-78 -132 -88 -152" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M-68 -78 Q-68 -132 -68 -165" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M-68 -78 Q-55 -132 -45 -152" fill="none" stroke="#222" stroke-width="2"/>
      <ellipse cx="-95" cy="-165" rx="10" ry="14" fill="none" stroke="#222" stroke-width="1.5"/>
      <ellipse cx="-68" cy="-178" rx="12" ry="16" fill="none" stroke="#222" stroke-width="1.5"/>
      <ellipse cx="-38" cy="-162" rx="9" ry="12" fill="none" stroke="#222" stroke-width="1.5"/>
      <path d="M-68 28 Q0 40 68 22" fill="none" stroke="#222" stroke-width="1.5"/>
    </g>`
  },
  {
    name: 'octopus',
    nameKo: '문어',
    svg: `<g transform="translate(400, 380)">
      <ellipse cx="0" cy="-30" rx="80" ry="70" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="-28" cy="-45" r="18" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="28" cy="-45" r="18" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="-25" cy="-42" r="7" fill="#222"/>
      <circle cx="31" cy="-42" r="7" fill="#222"/>
      <path d="M-12 -10 Q0 5 12 -10" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M-75 40 Q-100 80 -85 130 Q-70 160 -55 140 Q-45 110 -60 70 Q-55 50 -50 40" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-45 45 Q-55 95 -35 150 Q-20 175 -5 155 Q5 120 -15 80 Q-20 55 -25 45" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-15 50 Q-10 110 15 165 Q30 185 45 160 Q50 125 25 85 Q15 60 10 50" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M25 45 Q45 100 70 145 Q85 165 95 140 Q95 105 65 70 Q50 50 45 45" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M50 40 Q80 75 100 110 Q115 130 120 105 Q115 75 85 50 Q70 40 65 40" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="-80" cy="130" r="6" fill="none" stroke="#222" stroke-width="1.5"/>
      <circle cx="-28" cy="155" r="6" fill="none" stroke="#222" stroke-width="1.5"/>
      <circle cx="30" cy="165" r="6" fill="none" stroke="#222" stroke-width="1.5"/>
      <circle cx="80" cy="145" r="6" fill="none" stroke="#222" stroke-width="1.5"/>
      <circle cx="108" cy="108" r="6" fill="none" stroke="#222" stroke-width="1.5"/>
    </g>`
  },
  {
    name: 'turtle',
    nameKo: '거북이',
    svg: `<g transform="translate(400, 420)">
      <ellipse cx="0" cy="0" rx="110" ry="80" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M0 -75 L-40 -35 L-25 0 L0 -20 L25 0 L40 -35 Z" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M-40 -35 L-80 0 L-55 35 L-25 0" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M40 -35 L80 0 L55 35 L25 0" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M-25 0 L-55 35 L-25 70 L0 45 L25 70 L55 35 L25 0" fill="none" stroke="#222" stroke-width="2"/>
      <ellipse cx="-130" cy="20" rx="35" ry="28" fill="none" stroke="#222" stroke-width="3"/>
      <circle cx="-145" cy="12" r="6" fill="#222"/>
      <path d="M-100 -50 Q-130 -80 -110 -100 Q-90 -85 -85 -60" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M100 -50 Q130 -80 110 -100 Q90 -85 85 -60" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-95 50 Q-125 85 -105 110 Q-85 95 -80 65" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M95 50 Q125 85 105 110 Q85 95 80 65" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M105 0 L145 15 L140 -5 Z" fill="none" stroke="#222" stroke-width="3"/>
    </g>`
  }
];

const fantasyTemplates: SVGTemplate[] = [
  {
    name: 'unicorn',
    nameKo: '유니콘',
    svg: `<g transform="translate(400, 440)">
      <ellipse cx="0" cy="35" rx="105" ry="65" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M75 -8 Q98 -52 75 -95" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M55 2 Q65 -42 55 -85" fill="none" stroke="#222" stroke-width="3"/>
      <ellipse cx="85" cy="-105" rx="48" ry="38" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M90 -142 L95 -212" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M85 -152 Q95 -158 90 -168" fill="none" stroke="#222" stroke-width="1.5"/>
      <path d="M85 -168 Q95 -175 90 -185" fill="none" stroke="#222" stroke-width="1.5"/>
      <path d="M85 -185 Q95 -192 92 -202" fill="none" stroke="#222" stroke-width="1.5"/>
      <path d="M60 -138 Q48 -170 65 -152" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M110 -132 Q122 -165 105 -148" fill="none" stroke="#222" stroke-width="2"/>
      <ellipse cx="105" cy="-105" rx="12" ry="14" fill="none" stroke="#222" stroke-width="2"/>
      <ellipse cx="108" cy="-102" rx="5" ry="6" fill="#222"/>
      <path d="M100 -118 Q105 -125 110 -118" fill="none" stroke="#222" stroke-width="1.5"/>
      <ellipse cx="128" cy="-95" rx="5" ry="4" fill="#222"/>
      <path d="M55 -85 Q32 -108 48 -128 Q65 -108 60 -85" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M50 -75 Q22 -92 38 -112 Q58 -98 55 -75" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M45 -55 Q12 -65 28 -92 Q55 -82 50 -55" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M58 -22 Q28 -28 32 -55 Q55 -45 58 -22" fill="none" stroke="#222" stroke-width="2"/>
      <rect x="-65" y="88" width="28" height="75" rx="12" fill="none" stroke="#222" stroke-width="3"/>
      <rect x="-28" y="88" width="28" height="75" rx="12" fill="none" stroke="#222" stroke-width="3"/>
      <rect x="18" y="88" width="28" height="75" rx="12" fill="none" stroke="#222" stroke-width="3"/>
      <rect x="55" y="88" width="28" height="75" rx="12" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-105 22 Q-148 0 -138 -45 Q-128 -22 -118 -35 Q-108 -12 -105 22" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M-105 32 Q-158 22 -148 -22" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M-105 45 Q-172 45 -155 0" fill="none" stroke="#222" stroke-width="2"/>
      <polygon points="-140,-88 -135,-75 -122,-75 -132,-65 -128,-52 -140,-62 -152,-52 -148,-65 -158,-75 -145,-75" fill="none" stroke="#222" stroke-width="1.5"/>
    </g>`
  },
  {
    name: 'dragon',
    nameKo: '용',
    svg: `<g transform="translate(400, 420)">
      <ellipse cx="0" cy="30" rx="100" ry="70" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-80 -30 Q-100 -80 -60 -120" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-50 -20 Q-60 -60 -30 -100" fill="none" stroke="#222" stroke-width="3"/>
      <ellipse cx="-45" cy="-130" rx="55" ry="45" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-80 -165 L-95 -200 L-75 -175" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M-60 -170 L-70 -210 L-50 -180" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="-60" cy="-135" r="12" fill="none" stroke="#222" stroke-width="2"/>
      <circle cx="-57" cy="-132" r="5" fill="#222"/>
      <path d="M-8 -135 L20 -140 L15 -130 L-5 -130" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M-30 -100 Q0 -85 20 -110 Q0 -95 -20 -105" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M50 -40 Q120 -100 170 -60 Q140 -50 120 -20 Q100 -35 80 -20 Q70 -30 50 -20" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M50 40 Q120 100 170 60 Q140 50 120 20 Q100 35 80 20 Q70 30 50 20" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-100 30 Q-150 20 -180 50 Q-150 60 -130 90 Q-140 70 -100 50" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-180 50 Q-210 55 -200 40 Q-190 60 -180 50" fill="none" stroke="#222" stroke-width="2"/>
      <rect x="-50" y="88" width="30" height="55" rx="12" fill="none" stroke="#222" stroke-width="3"/>
      <rect x="20" y="88" width="30" height="55" rx="12" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-40 90 L-55 105" stroke="#222" stroke-width="2"/>
      <path d="M-40 100 L-55 115" stroke="#222" stroke-width="2"/>
      <path d="M60 90 L75 105" stroke="#222" stroke-width="2"/>
      <path d="M60 100 L75 115" stroke="#222" stroke-width="2"/>
    </g>`
  },
  {
    name: 'castle',
    nameKo: '성',
    svg: `<g transform="translate(400, 450)">
      <rect x="-140" y="-150" width="280" height="200" fill="none" stroke="#222" stroke-width="3"/>
      <rect x="-160" y="-200" width="50" height="250" fill="none" stroke="#222" stroke-width="3"/>
      <rect x="110" y="-200" width="50" height="250" fill="none" stroke="#222" stroke-width="3"/>
      <rect x="-50" y="-230" width="100" height="280" fill="none" stroke="#222" stroke-width="3"/>
      <path d="M-160 -200 L-160 -220 L-150 -200 L-150 -220 L-140 -200 L-140 -220 L-130 -200 L-130 -220 L-120 -200 L-120 -220 L-110 -200" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M110 -200 L110 -220 L120 -200 L120 -220 L130 -200 L130 -220 L140 -200 L140 -220 L150 -200 L150 -220 L160 -200" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M-50 -230 L-50 -250 L-40 -230 L-40 -250 L-30 -230 L-30 -250 L-20 -230 L-20 -250 L-10 -230 L-10 -250 L0 -230 L0 -250 L10 -230 L10 -250 L20 -230 L20 -250 L30 -230 L30 -250 L40 -230 L40 -250 L50 -230" fill="none" stroke="#222" stroke-width="2"/>
      <path d="M-30 50 L-30 -30 A30 30 0 0 1 30 -30 L30 50" fill="none" stroke="#222" stroke-width="3"/>
      <rect x="-120" y="-120" width="50" height="40" fill="none" stroke="#222" stroke-width="2"/>
      <line x1="-95" y1="-120" x2="-95" y2="-80" stroke="#222" stroke-width="2"/>
      <line x1="-120" y1="-100" x2="-70" y2="-100" stroke="#222" stroke-width="2"/>
      <rect x="70" y="-120" width="50" height="40" fill="none" stroke="#222" stroke-width="2"/>
      <line x1="95" y1="-120" x2="95" y2="-80" stroke="#222" stroke-width="2"/>
      <line x1="70" y1="-100" x2="120" y2="-100" stroke="#222" stroke-width="2"/>
      <rect x="-25" y="-200" width="50" height="35" fill="none" stroke="#222" stroke-width="2"/>
      <line x1="0" y1="-200" x2="0" y2="-165" stroke="#222" stroke-width="2"/>
      <line x1="-25" y1="-182" x2="25" y2="-182" stroke="#222" stroke-width="2"/>
      <rect x="-145" y="-100" width="20" height="25" fill="none" stroke="#222" stroke-width="2"/>
      <rect x="125" y="-100" width="20" height="25" fill="none" stroke="#222" stroke-width="2"/>
    </g>`
  }
];

// ============================================
// 테마별 템플릿 매핑
// ============================================

const themeTemplateMap: Record<string, SVGTemplate[]> = {
  ANIMALS: animalTemplates,
  NATURE: natureTemplates,
  VEHICLES: vehicleTemplates,
  FOOD: foodTemplates,
  SPACE: spaceTemplates,
  OCEAN: oceanTemplates,
  FANTASY: fantasyTemplates,
  SPORTS: animalTemplates, // 폴백
  SEASONS: natureTemplates, // 폴백
  HOLIDAYS: foodTemplates, // 폴백
};

const themeKorean: Record<string, string> = {
  ANIMALS: '동물',
  NATURE: '자연',
  VEHICLES: '탈것',
  FOOD: '음식',
  SPACE: '우주',
  OCEAN: '바다',
  FANTASY: '판타지',
  SPORTS: '스포츠',
  SEASONS: '계절',
  HOLIDAYS: '명절',
};

const techniqueKorean: Record<string, string> = {
  COLORING: '색칠하기',
  MANDALA: '만다라',
  ORIGAMI: '종이접기',
  PATTERN: '패턴',
  DOT_CONNECT: '점잇기',
  LINE_DRAWING: '선그리기',
  MAZE: '미로',
};

// ============================================
// SVG 생성 함수
// ============================================

function selectTemplate(theme: string, subTheme: string, additionalDetails: string): SVGTemplate {
  const templates = themeTemplateMap[theme] || animalTemplates;

  // subTheme이나 additionalDetails에 특정 키워드가 있으면 매칭
  const searchText = `${subTheme} ${additionalDetails}`.toLowerCase();

  // 키워드 매칭 시도
  for (const template of templates) {
    if (searchText.includes(template.name) || searchText.includes(template.nameKo)) {
      return template;
    }
  }

  // 랜덤 선택
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
}

function generateSVG(
  technique: string,
  theme: string,
  subTheme: string,
  additionalDetails: string,
  ageGroup: string,
  difficulty: number
): string {
  const template = selectTemplate(theme, subTheme, additionalDetails);
  const themeLabel = themeKorean[theme] || theme;
  const techniqueLabel = techniqueKorean[technique] || technique;

  // 제목 생성
  let title = `${template.nameKo} ${techniqueLabel}`;
  if (additionalDetails) {
    const shortDetails = additionalDetails.length > 15
      ? additionalDetails.substring(0, 15) + '...'
      : additionalDetails;
    title = `${template.nameKo} - ${shortDetails}`;
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
  <rect width="800" height="1000" fill="white"/>
  <rect x="25" y="25" width="750" height="950" fill="none" stroke="#333" stroke-width="2" rx="15"/>

  <rect x="40" y="40" width="720" height="55" fill="#f8f9fa" rx="10"/>
  <text x="400" y="78" font-family="Arial, sans-serif" font-size="24" fill="#222" text-anchor="middle" font-weight="bold">${title}</text>

  ${template.svg}

  <rect x="40" y="870" width="720" height="100" fill="#fafafa" rx="10" stroke="#eee" stroke-width="1"/>
  <text x="60" y="898" font-family="Arial, sans-serif" font-size="14" fill="#444" font-weight="bold">활동 안내</text>
  <text x="60" y="920" font-family="Arial, sans-serif" font-size="12" fill="#666">• 선 안쪽을 예쁜 색으로 색칠해 보세요</text>
  <text x="60" y="940" font-family="Arial, sans-serif" font-size="12" fill="#666">• 색연필, 크레파스, 사인펜 등을 자유롭게 사용하세요</text>
  <text x="60" y="960" font-family="Arial, sans-serif" font-size="12" fill="#666">• 나만의 배경도 그려보세요!</text>

  <text x="400" y="988" font-family="Arial, sans-serif" font-size="9" fill="#aaa" text-anchor="middle">ArtSheet Pro</text>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// ============================================
// AI 이미지 생성 (Gemini API)
// ============================================

async function generateWithGeminiAI(prompt: string): Promise<string | null> {
  if (!apiKey) {
    console.log('No API key configured');
    return null;
  }

  try {
    console.log('Calling Gemini API...');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ['IMAGE'],
            temperature: 0.9,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', response.status);
      return null;
    }

    const data = await response.json();

    for (const candidate of data.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData) {
          console.log('Gemini image generated successfully');
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Gemini API call failed:', error);
    return null;
  }
}

function buildAIPrompt(options: GenerateOptions): string {
  const themeLabel = themeKorean[options.theme] || options.theme;

  return `Create a children's coloring book page illustration.

SUBJECT: ${options.subTheme || themeLabel}
${options.additionalDetails ? `SPECIFIC DETAILS: ${options.additionalDetails}` : ''}

REQUIREMENTS:
- Black line art on pure white background
- Bold, clean outlines (3-4px stroke)
- Simple, cute style for children
- Proper anatomy and proportions
- No overlapping body parts
- Large areas for coloring
- No shading, gradients, or filled areas
- No text or watermarks
- Professional coloring book quality

Create a single, centered illustration ready for children to color.`;
}

// ============================================
// 메인 생성 함수
// ============================================

export async function generateArtSheets(options: GenerateOptions): Promise<GeneratedSheet[]> {
  const count = options.count || 1;
  const results: GeneratedSheet[] = [];

  console.log('=== Generating Art Sheets ===');
  console.log('Theme:', options.theme);
  console.log('SubTheme:', options.subTheme);
  console.log('Additional:', options.additionalDetails);
  console.log('Count:', count);

  for (let i = 0; i < count; i++) {
    let imageUrl: string | null = null;
    let modelVersion = 'svg-v3';

    // AI 생성 시도
    const aiPrompt = buildAIPrompt(options);
    imageUrl = await generateWithGeminiAI(aiPrompt);

    if (imageUrl) {
      modelVersion = 'gemini-2.0-flash';
      console.log(`Image ${i + 1}: Generated with AI`);
    } else {
      // SVG 폴백 - 테마와 추가설명 반영
      console.log(`Image ${i + 1}: Using SVG template`);
      imageUrl = generateSVG(
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
      prompt: aiPrompt,
      cached: false,
      metadata: {
        technique: options.technique,
        theme: options.theme,
        subTheme: options.subTheme || '',
        ageGroup: options.ageGroup,
        difficulty: options.difficulty,
        generatedAt: new Date().toISOString(),
        modelVersion,
      },
    });
  }

  console.log(`Generated ${results.length} sheets`);
  return results;
}

export async function generateBatchSheets(
  requests: GenerateOptions[]
): Promise<Map<string, GeneratedSheet[]>> {
  const results = new Map<string, GeneratedSheet[]>();

  for (const req of requests) {
    const sheets = await generateArtSheets(req);
    results.set(`${req.technique}_${req.theme}_${req.subTheme}`, sheets);
  }

  return results;
}
