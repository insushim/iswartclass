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
            responseModalities: ['TEXT', 'IMAGE'],
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
    console.log('Gemini response received');

    // Extract image from response
    const candidates = data.candidates || [];
    for (const candidate of candidates) {
      const parts = candidate.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          const { mimeType, data: imageData } = part.inlineData;
          console.log('Image found in response');
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

// Generate a detailed placeholder SVG
function generatePlaceholderSVG(
  technique: string,
  theme: string,
  subTheme: string,
  additionalDetails: string,
  index: number
): string {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const color = colors[index % colors.length];

  const techniqueLabel = {
    COLORING: '색칠하기',
    MANDALA: '만다라',
    ORIGAMI: '종이접기',
    PATTERN: '패턴 연습',
    DOT_CONNECT: '점잇기',
    LINE_DRAWING: '선 그리기',
  }[technique] || technique;

  const themeEmoji = {
    ANIMALS: '🐱',
    NATURE: '🌸',
    VEHICLES: '🚗',
    FOOD: '🍎',
    SPACE: '🚀',
    OCEAN: '🐠',
    FANTASY: '🦄',
    SPORTS: '⚽',
  }[theme] || '🎨';

  // Create a more meaningful placeholder based on the request
  const title = subTheme || theme;
  const description = additionalDetails || `${theme} 주제의 ${techniqueLabel} 도안`;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="800" height="1000" fill="white"/>
  <rect width="800" height="1000" fill="url(#grid)"/>

  <!-- Border -->
  <rect x="30" y="30" width="740" height="940" fill="none" stroke="${color}" stroke-width="3" rx="20"/>

  <!-- Title area -->
  <rect x="50" y="50" width="700" height="100" fill="${color}" opacity="0.1" rx="15"/>
  <text x="400" y="95" font-family="Arial, sans-serif" font-size="36" fill="${color}" text-anchor="middle" font-weight="bold">
    ${title}
  </text>
  <text x="400" y="130" font-family="Arial, sans-serif" font-size="18" fill="#6b7280" text-anchor="middle">
    ${techniqueLabel} 도안
  </text>

  <!-- Main drawing area -->
  <rect x="50" y="170" width="700" height="600" fill="#fafafa" rx="15" stroke="#e5e7eb" stroke-width="2"/>

  <!-- Central icon -->
  <text x="400" y="450" font-family="Arial" font-size="120" text-anchor="middle">
    ${themeEmoji}
  </text>

  <!-- Technique indicator -->
  <text x="400" y="550" font-family="Arial, sans-serif" font-size="20" fill="#9ca3af" text-anchor="middle">
    ${description}
  </text>

  <!-- Drawing guide lines based on technique -->
  ${technique === 'COLORING' ? `
    <circle cx="400" cy="420" r="150" fill="none" stroke="#d1d5db" stroke-width="2" stroke-dasharray="10,5"/>
  ` : technique === 'MANDALA' ? `
    <circle cx="400" cy="420" r="120" fill="none" stroke="#d1d5db" stroke-width="2"/>
    <circle cx="400" cy="420" r="80" fill="none" stroke="#d1d5db" stroke-width="2"/>
    <circle cx="400" cy="420" r="40" fill="none" stroke="#d1d5db" stroke-width="2"/>
  ` : technique === 'DOT_CONNECT' ? `
    <circle cx="300" cy="350" r="8" fill="${color}"/><text x="300" y="335" font-size="14" fill="${color}" text-anchor="middle">1</text>
    <circle cx="400" cy="300" r="8" fill="${color}"/><text x="400" y="285" font-size="14" fill="${color}" text-anchor="middle">2</text>
    <circle cx="500" cy="350" r="8" fill="${color}"/><text x="500" y="335" font-size="14" fill="${color}" text-anchor="middle">3</text>
    <circle cx="450" cy="450" r="8" fill="${color}"/><text x="450" y="435" font-size="14" fill="${color}" text-anchor="middle">4</text>
    <circle cx="350" cy="450" r="8" fill="${color}"/><text x="350" y="435" font-size="14" fill="${color}" text-anchor="middle">5</text>
  ` : ''}

  <!-- Instructions area -->
  <rect x="50" y="790" width="700" height="160" fill="#f8fafc" rx="15" stroke="#e5e7eb" stroke-width="1"/>

  <text x="80" y="830" font-family="Arial, sans-serif" font-size="16" fill="#374151" font-weight="bold">
    활동 안내
  </text>
  <text x="80" y="860" font-family="Arial, sans-serif" font-size="14" fill="#6b7280">
    • 기법: ${techniqueLabel}
  </text>
  <text x="80" y="885" font-family="Arial, sans-serif" font-size="14" fill="#6b7280">
    • 주제: ${theme}${subTheme ? ` - ${subTheme}` : ''}
  </text>
  <text x="80" y="910" font-family="Arial, sans-serif" font-size="14" fill="#6b7280">
    • 자유롭게 색칠하거나 그려보세요!
  </text>

  <!-- Footer -->
  <text x="400" y="970" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af" text-anchor="middle">
    ArtSheet Pro • AI 기반 미술 도안 생성 서비스
  </text>

  <!-- Page number -->
  <text x="750" y="970" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af" text-anchor="end">
    #${index + 1}
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

    // Try Gemini 2.0 Flash first (more reliable for image generation)
    console.log(`Generating image ${i + 1}/${count}...`);

    try {
      imageUrl = await generateWithGemini(imagePrompt);
      if (imageUrl) {
        modelVersion = 'gemini-2.0-flash-exp';
        console.log('Successfully generated with Gemini 2.0');
      }
    } catch (e) {
      console.error('Gemini generation error:', e);
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
      console.log('Using placeholder SVG');
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
