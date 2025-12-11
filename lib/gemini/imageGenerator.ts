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

// Technique-specific prompts for better art sheet generation
const techniquePrompts: Record<string, string> = {
  COLORING: `Create a children's coloring page with clear BLACK OUTLINES on WHITE background.
The design should have:
- Clean, bold black lines (no shading or filled areas)
- Simple shapes suitable for coloring
- Clear separation between areas to color
- No colors filled in - just outlines
Style: Line art coloring book page for children`,

  MANDALA: `Create a circular mandala coloring page design with:
- Symmetrical patterns radiating from center
- BLACK LINE ART on WHITE background
- Intricate but age-appropriate patterns
- Clear, bold outlines ready for coloring
Style: Mandala coloring page, line art only`,

  ORIGAMI: `Create an origami instruction diagram showing:
- Step-by-step folding instructions
- Numbered steps with dotted fold lines
- Clear arrows showing fold directions
- Simple line drawings on white background
Style: Technical origami instruction sheet`,

  PATTERN: `Create a pattern practice worksheet with:
- Repeating pattern examples at the top
- Empty spaces below for practice
- Dotted guide lines
- BLACK LINE ART on WHITE background
Style: Educational pattern practice worksheet`,

  DOT_CONNECT: `Create a dot-to-dot activity page with:
- Numbered dots that form a picture when connected
- Numbers in sequence (1, 2, 3...)
- Clear, visible dots and numbers
- WHITE background
Style: Connect-the-dots activity page`,

  LINE_DRAWING: `Create a drawing practice worksheet with:
- Dotted lines to trace
- Guide lines for practice
- Simple shapes to copy
- BLACK on WHITE background
Style: Line drawing practice sheet for children`,
};

// Age-specific complexity adjustments
const ageComplexity: Record<string, string> = {
  '5-6': 'Very simple, large shapes, minimal details, easy to color within lines',
  '7-9': 'Moderate complexity, medium-sized details, some intricate areas',
  '10-12': 'More detailed and complex patterns, finer lines, challenging areas',
  ALL: 'Moderate complexity suitable for various ages',
};

// Generate image using Gemini 2.0 Flash experimental with image output
async function generateWithGemini(prompt: string): Promise<string | null> {
  try {
    console.log('Attempting Gemini 2.0 Flash image generation...');

    // 이미지 생성에 최적화된 프롬프트
    const imagePrompt = `Generate an image: ${prompt}

IMPORTANT: You MUST generate and return an actual image, not text or emoji.
Create a high-quality, printable art worksheet image.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: imagePrompt }]
          }],
          generationConfig: {
            responseModalities: ['IMAGE'],
            temperature: 1,
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
    console.log('Gemini response:', JSON.stringify(data).substring(0, 500));

    // Extract image from response
    const candidates = data.candidates || [];
    for (const candidate of candidates) {
      const parts = candidate.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          const { mimeType, data: imageData } = part.inlineData;
          console.log('Image found in response, mimeType:', mimeType);
          return `data:${mimeType};base64,${imageData}`;
        }
      }
    }

    console.log('No image found in Gemini response');
    return null;
  } catch (error) {
    console.error('Gemini 2.0 image generation failed:', error);
    return null;
  }
}

// Generate image using Imagen 3 via REST API
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
    console.log('Imagen 3 response:', JSON.stringify(data).substring(0, 300));

    if (data.predictions && data.predictions.length > 0) {
      const imageBytes = data.predictions[0].bytesBase64Encoded;
      if (imageBytes) {
        console.log('Imagen 3 image generated successfully');
        return `data:image/png;base64,${imageBytes}`;
      }
    }

    console.log('No image in Imagen 3 response');
    return null;
  } catch (error) {
    console.error('Imagen 3 generation failed:', error);
    return null;
  }
}

// Generate image using Gemini 2.0 Flash with imagen model
async function generateWithGeminiImagen(prompt: string): Promise<string | null> {
  try {
    console.log('Attempting Gemini Imagen generation...');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `Create an image: ${prompt}` }]
          }],
          generationConfig: {
            responseModalities: ['IMAGE'],
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini Imagen API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    console.log('Gemini Imagen response:', JSON.stringify(data).substring(0, 500));

    const candidates = data.candidates || [];
    for (const candidate of candidates) {
      const parts = candidate.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          const { mimeType, data: imageData } = part.inlineData;
          console.log('Image found, mimeType:', mimeType);
          return `data:${mimeType};base64,${imageData}`;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Gemini Imagen generation failed:', error);
    return null;
  }
}

// Generate coloring page SVG templates based on theme
function generateColoringTemplate(theme: string, subTheme: string): string {
  const templates: Record<string, string> = {
    ANIMALS: `
      <!-- Cat outline -->
      <ellipse cx="400" cy="380" rx="120" ry="100" fill="none" stroke="#333" stroke-width="3"/>
      <ellipse cx="400" cy="320" rx="80" ry="70" fill="none" stroke="#333" stroke-width="3"/>
      <!-- Ears -->
      <path d="M340 270 L320 200 L360 250 Z" fill="none" stroke="#333" stroke-width="3"/>
      <path d="M460 270 L480 200 L440 250 Z" fill="none" stroke="#333" stroke-width="3"/>
      <!-- Eyes -->
      <ellipse cx="370" cy="310" rx="15" ry="20" fill="none" stroke="#333" stroke-width="2"/>
      <ellipse cx="430" cy="310" rx="15" ry="20" fill="none" stroke="#333" stroke-width="2"/>
      <!-- Nose -->
      <path d="M400 340 L390 355 L410 355 Z" fill="none" stroke="#333" stroke-width="2"/>
      <!-- Mouth -->
      <path d="M400 355 Q400 370 385 375" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M400 355 Q400 370 415 375" fill="none" stroke="#333" stroke-width="2"/>
      <!-- Whiskers -->
      <line x1="340" y1="350" x2="280" y2="340" stroke="#333" stroke-width="2"/>
      <line x1="340" y1="360" x2="280" y2="365" stroke="#333" stroke-width="2"/>
      <line x1="460" y1="350" x2="520" y2="340" stroke="#333" stroke-width="2"/>
      <line x1="460" y1="360" x2="520" y2="365" stroke="#333" stroke-width="2"/>
      <!-- Tail -->
      <path d="M520 400 Q580 350 560 280" fill="none" stroke="#333" stroke-width="3"/>
      <!-- Paws -->
      <ellipse cx="350" cy="480" rx="30" ry="20" fill="none" stroke="#333" stroke-width="2"/>
      <ellipse cx="450" cy="480" rx="30" ry="20" fill="none" stroke="#333" stroke-width="2"/>
    `,
    NATURE: `
      <!-- Flower -->
      <circle cx="400" cy="350" r="30" fill="none" stroke="#333" stroke-width="3"/>
      <ellipse cx="400" cy="290" rx="25" ry="40" fill="none" stroke="#333" stroke-width="2"/>
      <ellipse cx="450" cy="320" rx="25" ry="40" fill="none" stroke="#333" stroke-width="2" transform="rotate(72 400 350)"/>
      <ellipse cx="430" cy="390" rx="25" ry="40" fill="none" stroke="#333" stroke-width="2" transform="rotate(144 400 350)"/>
      <ellipse cx="370" cy="390" rx="25" ry="40" fill="none" stroke="#333" stroke-width="2" transform="rotate(216 400 350)"/>
      <ellipse cx="350" cy="320" rx="25" ry="40" fill="none" stroke="#333" stroke-width="2" transform="rotate(288 400 350)"/>
      <!-- Stem -->
      <path d="M400 400 Q410 450 400 520" fill="none" stroke="#333" stroke-width="3"/>
      <!-- Leaves -->
      <path d="M400 450 Q450 430 470 450 Q450 470 400 450" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M400 480 Q350 460 330 480 Q350 500 400 480" fill="none" stroke="#333" stroke-width="2"/>
    `,
    VEHICLES: `
      <!-- Car body -->
      <path d="M250 400 L280 400 L300 350 L500 350 L520 400 L550 400 L550 450 L250 450 Z" fill="none" stroke="#333" stroke-width="3"/>
      <!-- Windows -->
      <path d="M310 360 L330 400 L470 400 L490 360 Z" fill="none" stroke="#333" stroke-width="2"/>
      <line x1="400" y1="360" x2="400" y2="400" stroke="#333" stroke-width="2"/>
      <!-- Wheels -->
      <circle cx="320" cy="450" r="40" fill="none" stroke="#333" stroke-width="3"/>
      <circle cx="320" cy="450" r="20" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="480" cy="450" r="40" fill="none" stroke="#333" stroke-width="3"/>
      <circle cx="480" cy="450" r="20" fill="none" stroke="#333" stroke-width="2"/>
      <!-- Headlights -->
      <rect x="540" y="410" width="20" height="15" rx="3" fill="none" stroke="#333" stroke-width="2"/>
      <rect x="240" y="410" width="20" height="15" rx="3" fill="none" stroke="#333" stroke-width="2"/>
    `,
    FOOD: `
      <!-- Apple -->
      <path d="M400 280 Q340 300 320 380 Q310 460 400 500 Q490 460 480 380 Q460 300 400 280" fill="none" stroke="#333" stroke-width="3"/>
      <!-- Stem -->
      <path d="M400 280 Q410 250 400 230" fill="none" stroke="#333" stroke-width="3"/>
      <!-- Leaf -->
      <path d="M400 250 Q440 230 450 250 Q440 270 400 260" fill="none" stroke="#333" stroke-width="2"/>
      <!-- Highlight -->
      <ellipse cx="360" cy="340" rx="20" ry="30" fill="none" stroke="#333" stroke-width="1" stroke-dasharray="5,5"/>
    `,
    SPACE: `
      <!-- Rocket -->
      <path d="M400 200 Q420 220 420 280 L420 400 L380 400 L380 280 Q380 220 400 200" fill="none" stroke="#333" stroke-width="3"/>
      <!-- Nose -->
      <path d="M380 280 L400 240 L420 280" fill="none" stroke="#333" stroke-width="2"/>
      <!-- Fins -->
      <path d="M380 380 L340 420 L360 420 L380 400" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M420 380 L460 420 L440 420 L420 400" fill="none" stroke="#333" stroke-width="2"/>
      <!-- Window -->
      <circle cx="400" cy="320" r="25" fill="none" stroke="#333" stroke-width="2"/>
      <!-- Flames -->
      <path d="M385 400 Q380 450 400 480 Q420 450 415 400" fill="none" stroke="#333" stroke-width="2"/>
      <!-- Stars -->
      <polygon points="300,300 305,315 320,315 308,325 313,340 300,330 287,340 292,325 280,315 295,315" fill="none" stroke="#333" stroke-width="1"/>
      <polygon points="500,250 503,260 515,260 506,268 509,280 500,272 491,280 494,268 485,260 497,260" fill="none" stroke="#333" stroke-width="1"/>
    `,
    OCEAN: `
      <!-- Fish body -->
      <ellipse cx="400" cy="380" rx="120" ry="60" fill="none" stroke="#333" stroke-width="3"/>
      <!-- Tail -->
      <path d="M520 380 L580 330 L580 430 Z" fill="none" stroke="#333" stroke-width="3"/>
      <!-- Eye -->
      <circle cx="330" cy="370" r="15" fill="none" stroke="#333" stroke-width="2"/>
      <circle cx="330" cy="370" r="5" fill="#333"/>
      <!-- Mouth -->
      <path d="M280 390 Q290 400 280 410" fill="none" stroke="#333" stroke-width="2"/>
      <!-- Fins -->
      <path d="M380 320 Q400 270 420 320" fill="none" stroke="#333" stroke-width="2"/>
      <path d="M380 440 Q400 490 420 440" fill="none" stroke="#333" stroke-width="2"/>
      <!-- Scales pattern -->
      <path d="M350 360 Q370 350 390 360" fill="none" stroke="#333" stroke-width="1"/>
      <path d="M370 380 Q390 370 410 380" fill="none" stroke="#333" stroke-width="1"/>
      <path d="M390 400 Q410 390 430 400" fill="none" stroke="#333" stroke-width="1"/>
      <!-- Bubbles -->
      <circle cx="260" cy="340" r="10" fill="none" stroke="#333" stroke-width="1"/>
      <circle cx="250" cy="310" r="6" fill="none" stroke="#333" stroke-width="1"/>
    `,
  };

  return templates[theme] || templates.ANIMALS;
}

// Generate a detailed placeholder SVG
function generatePlaceholderSVG(
  technique: string,
  theme: string,
  subTheme: string,
  additionalDetails: string,
  index: number
): string {
  const techniqueLabel = {
    COLORING: '색칠하기',
    MANDALA: '만다라',
    ORIGAMI: '종이접기',
    PATTERN: '패턴 연습',
    DOT_CONNECT: '점잇기',
    LINE_DRAWING: '선 그리기',
  }[technique] || technique;

  const themeLabel = {
    ANIMALS: '동물',
    NATURE: '자연',
    VEHICLES: '탈것',
    FOOD: '음식',
    SPACE: '우주',
    OCEAN: '바다',
    FANTASY: '판타지',
    SPORTS: '스포츠',
  }[theme] || theme;

  // Get coloring template based on theme
  const coloringTemplate = generateColoringTemplate(theme, subTheme);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
  <!-- Background -->
  <rect width="800" height="1000" fill="white"/>

  <!-- Border -->
  <rect x="30" y="30" width="740" height="940" fill="none" stroke="#333" stroke-width="2" rx="10"/>

  <!-- Title area -->
  <text x="400" y="80" font-family="Arial, sans-serif" font-size="28" fill="#333" text-anchor="middle" font-weight="bold">
    ${themeLabel} ${techniqueLabel}
  </text>
  <line x1="100" y1="100" x2="700" y2="100" stroke="#ddd" stroke-width="1"/>

  <!-- Main drawing area with actual coloring template -->
  <g transform="translate(0, 50)">
    ${coloringTemplate}
  </g>

  <!-- Instructions area -->
  <rect x="50" y="850" width="700" height="120" fill="#fafafa" rx="10" stroke="#eee" stroke-width="1"/>
  <text x="70" y="880" font-family="Arial, sans-serif" font-size="14" fill="#666" font-weight="bold">
    활동 안내
  </text>
  <text x="70" y="905" font-family="Arial, sans-serif" font-size="12" fill="#888">
    • 테두리 안을 예쁜 색으로 색칠해 보세요
  </text>
  <text x="70" y="925" font-family="Arial, sans-serif" font-size="12" fill="#888">
    • 색연필, 크레파스, 사인펜 등을 사용할 수 있어요
  </text>
  <text x="70" y="945" font-family="Arial, sans-serif" font-size="12" fill="#888">
    • 배경도 자유롭게 꾸며보세요!
  </text>

  <!-- Footer -->
  <text x="400" y="985" font-family="Arial, sans-serif" font-size="10" fill="#aaa" text-anchor="middle">
    ArtSheet Pro
  </text>
</svg>`.trim();

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

// Build the full image generation prompt
function buildImagePrompt(options: GenerateOptions): string {
  const techniquePrompt = techniquePrompts[options.technique] || techniquePrompts.COLORING;
  const ageHint = ageComplexity[options.ageGroup] || ageComplexity.ALL;

  let prompt = `${techniquePrompt}

Subject: ${options.theme}${options.subTheme ? ` - ${options.subTheme}` : ''}
${options.additionalDetails ? `Specific details: ${options.additionalDetails}` : ''}

Age appropriateness: ${ageHint}
Difficulty level: ${options.difficulty}/5

IMPORTANT:
- Create a printable worksheet/coloring page
- Use only BLACK lines on WHITE background
- No colors, shading, or gradients
- Clean, professional quality suitable for printing
- Safe and appropriate for children`;

  return prompt;
}

// Generate description using Gemini
async function generateDescription(options: PromptOptions): Promise<string> {
  try {
    const prompt = `당신은 어린이 미술 교육 전문가입니다.
다음 조건에 맞는 미술 도안에 대한 간단한 설명(2-3문장)을 한국어로 작성해주세요:
- 기법: ${options.technique}
- 주제: ${options.theme}
- 세부 주제: ${options.subTheme || '없음'}
- 연령대: ${options.ageGroup}
- 난이도: ${options.difficulty}/5
${options.additionalDetails ? `- 추가 설명: ${options.additionalDetails}` : ''}

설명만 작성하고 다른 내용은 포함하지 마세요.`;

    const result = await geminiTextModel.generateContent(prompt);
    return result.response.text() || '';
  } catch (error) {
    console.error('Failed to generate description:', error);
    return `${options.theme} 주제의 ${options.technique} 미술 도안입니다.`;
  }
}

export async function generateArtSheets(options: GenerateOptions): Promise<GeneratedSheet[]> {
  const count = options.count || 1;
  const results: GeneratedSheet[] = [];

  console.log('Starting art sheet generation:', options);

  // Build the image generation prompt
  const imagePrompt = buildImagePrompt(options);
  console.log('Image prompt:', imagePrompt.substring(0, 200) + '...');

  // Also build the base prompt for reference
  const basePrompt = generateArtSheetPrompt({
    technique: options.technique,
    theme: options.theme,
    subTheme: options.subTheme,
    ageGroup: options.ageGroup,
    difficulty: options.difficulty,
    style: options.style,
    additionalDetails: options.additionalDetails
  });

  // Generate description using AI
  let description = '';
  try {
    description = await generateDescription(options);
    console.log('Generated description:', description.substring(0, 100));
  } catch (e) {
    console.error('Description generation failed:', e);
    description = `${options.theme} 주제의 미술 도안입니다.`;
  }

  // Generate images
  for (let i = 0; i < count; i++) {
    let imageUrl: string | null = null;
    let modelVersion = 'placeholder-v1';

    console.log(`Generating image ${i + 1}/${count}...`);

    // Try Gemini 2.0 Flash Imagen model first
    try {
      imageUrl = await generateWithGeminiImagen(imagePrompt);
      if (imageUrl) {
        modelVersion = 'gemini-2.0-flash-exp-image-generation';
        console.log('Successfully generated with Gemini Imagen');
      }
    } catch (e) {
      console.error('Gemini Imagen error:', e);
    }

    // Try standard Gemini 2.0 Flash
    if (!imageUrl) {
      console.log('Trying Gemini 2.0 Flash...');
      try {
        imageUrl = await generateWithGemini(imagePrompt);
        if (imageUrl) {
          modelVersion = 'gemini-2.0-flash-exp';
          console.log('Successfully generated with Gemini 2.0');
        }
      } catch (e) {
        console.error('Gemini generation error:', e);
      }
    }

    // Try Imagen 3 as fallback
    if (!imageUrl) {
      console.log('Trying Imagen 3...');
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

    // Final fallback to placeholder
    if (!imageUrl) {
      console.log('All image generation methods failed, using placeholder SVG');
      imageUrl = generatePlaceholderSVG(
        options.technique,
        options.theme,
        options.subTheme || '',
        options.additionalDetails || '',
        i
      );
    }

    results.push({
      imageUrl,
      thumbnailUrl: imageUrl,
      prompt: `${basePrompt}\n\n설명: ${description}`,
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

// Simplified batch generation
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
