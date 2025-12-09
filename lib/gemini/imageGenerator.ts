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

// Generate image using Imagen 3
async function generateWithImagen3(prompt: string): Promise<string | null> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    // Use the models.generateImages method
    const response = await (genAI as any).models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '3:4', // Portrait orientation for worksheets
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const imageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/png;base64,${imageBytes}`;
    }

    return null;
  } catch (error) {
    console.error('Imagen 3 generation failed:', error);
    return null;
  }
}

// Alternative: Generate image using Gemini 2.0 Flash with image generation
async function generateWithGemini2(prompt: string): Promise<string | null> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
    });

    // Gemini 2.0 can generate images with specific config
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['image', 'text'],
      } as any,
    });

    const response = result.response;
    const parts = response.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      if ((part as any).inlineData) {
        const inlineData = (part as any).inlineData;
        return `data:${inlineData.mimeType};base64,${inlineData.data}`;
      }
    }

    return null;
  } catch (error) {
    console.error('Gemini 2.0 image generation failed:', error);
    return null;
  }
}

// Generate a placeholder SVG for fallback
function generatePlaceholderSVG(
  technique: string,
  theme: string,
  subTheme: string,
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

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
  <rect width="800" height="1000" fill="white"/>
  <rect x="40" y="40" width="720" height="920" fill="none" stroke="${color}" stroke-width="4" stroke-dasharray="10,5"/>

  <!-- Title area -->
  <rect x="60" y="60" width="680" height="80" fill="${color}" opacity="0.1" rx="10"/>
  <text x="400" y="115" font-family="Arial, sans-serif" font-size="32" fill="${color}" text-anchor="middle" font-weight="bold">
    ${subTheme || theme}
  </text>

  <!-- Main content area -->
  <rect x="60" y="160" width="680" height="600" fill="#f8fafc" rx="10" stroke="#e2e8f0" stroke-width="2"/>

  <!-- Loading indicator -->
  <text x="400" y="420" font-family="Arial, sans-serif" font-size="24" fill="#94a3b8" text-anchor="middle">
    이미지 생성 중...
  </text>
  <text x="400" y="460" font-family="Arial, sans-serif" font-size="16" fill="#cbd5e1" text-anchor="middle">
    Imagen 3로 도안을 생성하고 있습니다
  </text>

  <!-- Spinner animation -->
  <circle cx="400" cy="520" r="30" fill="none" stroke="${color}" stroke-width="4" stroke-dasharray="60 30" opacity="0.5">
    <animateTransform attributeName="transform" type="rotate" from="0 400 520" to="360 400 520" dur="1s" repeatCount="indefinite"/>
  </circle>

  <!-- Instructions area -->
  <rect x="60" y="780" width="680" height="160" fill="#f1f5f9" rx="10"/>
  <text x="400" y="820" font-family="Arial, sans-serif" font-size="18" fill="#64748b" text-anchor="middle">
    기법: ${techniqueLabel}
  </text>
  <text x="400" y="850" font-family="Arial, sans-serif" font-size="16" fill="#94a3b8" text-anchor="middle">
    주제: ${theme} - ${subTheme || ''}
  </text>
  <text x="400" y="880" font-family="Arial, sans-serif" font-size="14" fill="#cbd5e1" text-anchor="middle">
    ArtSheet Pro에서 생성됨
  </text>

  <!-- Page number -->
  <text x="760" y="980" font-family="Arial, sans-serif" font-size="14" fill="#94a3b8" text-anchor="end">
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
${options.additionalDetails ? `Details: ${options.additionalDetails}` : ''}

Age appropriateness: ${ageHint}
Difficulty level: ${options.difficulty}/5

Important requirements:
- Must be suitable for children's art activity
- Clean, professional quality
- Ready to print on paper
- Safe and appropriate content only`;

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

  // Build the image generation prompt
  const imagePrompt = buildImagePrompt(options);

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
  const description = await generateDescription(options);

  // Generate images
  for (let i = 0; i < count; i++) {
    let imageUrl: string | null = null;
    let modelVersion = 'placeholder-v1';

    // Try Imagen 3 first
    console.log(`Generating image ${i + 1}/${count} with Imagen 3...`);
    imageUrl = await generateWithImagen3(imagePrompt);

    if (imageUrl) {
      modelVersion = 'imagen-3.0-generate-002';
      console.log(`Successfully generated image with Imagen 3`);
    } else {
      // Fallback to Gemini 2.0
      console.log('Imagen 3 failed, trying Gemini 2.0...');
      imageUrl = await generateWithGemini2(imagePrompt);

      if (imageUrl) {
        modelVersion = 'gemini-2.0-flash-exp';
        console.log(`Successfully generated image with Gemini 2.0`);
      } else {
        // Final fallback to placeholder
        console.log('All image generation failed, using placeholder');
        imageUrl = generatePlaceholderSVG(
          options.technique,
          options.theme,
          options.subTheme || '',
          i
        );
      }
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
