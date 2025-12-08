import { geminiModel } from './client';
import { generateArtSheetPrompt, PromptOptions } from './prompts/base';
import { uploadToR2, generateThumbnail } from '../cloudflare/r2';
import { optimizeImage, addWatermark } from '../image/processor';
import { getFromCache, saveToCache } from '../cache/redis';

export interface GenerateOptions extends PromptOptions {
  count?: number;
  useCache?: boolean;
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

function generateCacheKey(options: GenerateOptions): string {
  return `sheet:${options.technique}:${options.theme}:${options.subTheme}:${options.ageGroup}:${options.difficulty}`;
}

function addVariation(prompt: string, index: number): string {
  const variations = [
    'with a slightly different composition',
    'from a different angle',
    'with alternative styling',
    'with varied proportions',
    'with unique details'
  ];
  return `${prompt}, ${variations[index % variations.length]}`;
}

function extractImageFromResponse(response: unknown): Buffer | null {
  try {
    const resp = response as { candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { mimeType?: string; data?: string } }> } }> };
    const parts = resp.candidates?.[0]?.content?.parts;
    if (!parts) return null;

    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        return Buffer.from(part.inlineData.data || '', 'base64');
      }
    }
    return null;
  } catch (error) {
    console.error('Error extracting image:', error);
    return null;
  }
}

export async function generateArtSheets(options: GenerateOptions): Promise<GeneratedSheet[]> {
  const count = options.count || 1;
  const results: GeneratedSheet[] = [];

  const cacheKey = generateCacheKey(options);

  // Check cache first
  if (options.useCache !== false) {
    const cached = await getFromCache<GeneratedSheet[]>(cacheKey);
    if (cached && cached.length >= count) {
      return cached.slice(0, count).map(item => ({ ...item, cached: true }));
    }
  }

  // Generate prompt
  const prompt = generateArtSheetPrompt({
    technique: options.technique,
    theme: options.theme,
    subTheme: options.subTheme,
    ageGroup: options.ageGroup,
    difficulty: options.difficulty,
    style: options.style,
    additionalDetails: options.additionalDetails
  });

  // Generate images
  for (let i = 0; i < count; i++) {
    const variationPrompt = i === 0 ? prompt : addVariation(prompt, i);

    try {
      const result = await geminiModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: variationPrompt }] }],
      });

      const response = result.response;
      const imageData = extractImageFromResponse(response);

      if (imageData) {
        // Optimize image for A4 print (300 DPI)
        const optimized = await optimizeImage(imageData, {
          width: 2480,
          height: 3508,
          format: 'png',
          quality: 95
        });

        // Generate thumbnail
        const thumbnail = await generateThumbnail(optimized, 400);

        // Upload to R2
        const timestamp = Date.now();
        const filename = `${options.technique}_${options.theme}_${timestamp}_${i}`;

        const imageUrl = await uploadToR2(optimized, `sheets/${filename}.png`);
        const thumbnailUrl = await uploadToR2(thumbnail, `thumbnails/${filename}.png`);

        let originalUrl: string | undefined;

        // Add watermark if requested
        if (options.addWatermark) {
          originalUrl = imageUrl;
          const watermarked = await addWatermark(optimized, 'ArtSheet Pro');
          await uploadToR2(watermarked, `sheets/${filename}_wm.png`);
        }

        results.push({
          imageUrl,
          thumbnailUrl,
          originalUrl,
          prompt: variationPrompt,
          cached: false,
          metadata: {
            technique: options.technique,
            theme: options.theme,
            subTheme: options.subTheme,
            ageGroup: options.ageGroup,
            difficulty: options.difficulty,
            generatedAt: new Date().toISOString(),
            modelVersion: 'gemini-2.0-flash-exp'
          }
        });
      }
    } catch (error) {
      console.error(`Failed to generate image ${i + 1}:`, error);
      continue;
    }
  }

  // Cache results
  if (results.length > 0 && options.useCache !== false) {
    await saveToCache(cacheKey, results, 86400 * 7); // 7 days cache
  }

  return results;
}

export async function generateBatchSheets(
  requests: GenerateOptions[]
): Promise<Map<string, GeneratedSheet[]>> {
  const results = new Map<string, GeneratedSheet[]>();

  // Process in batches of 5 to avoid rate limiting
  const batchSize = 5;
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(req => generateArtSheets(req))
    );

    batch.forEach((req, idx) => {
      const key = `${req.technique}_${req.theme}_${req.subTheme}`;
      results.set(key, batchResults[idx]);
    });

    // Add delay between batches
    if (i + batchSize < requests.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

export async function generateVariation(
  originalPrompt: string,
  variationType: 'pose' | 'angle' | 'style' | 'elements' | 'composition'
): Promise<GeneratedSheet | null> {
  const variations: Record<string, string> = {
    pose: 'with a different pose or position',
    angle: 'from a different viewing angle',
    style: 'with a slightly different artistic style',
    elements: 'with different background elements',
    composition: 'with an alternative composition layout'
  };

  const variationPrompt = `${originalPrompt}\n\n**Variation:** Create this ${variations[variationType]}`;

  try {
    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: variationPrompt }] }],
    });

    const response = result.response;
    const imageData = extractImageFromResponse(response);

    if (imageData) {
      const optimized = await optimizeImage(imageData, {
        width: 2480,
        height: 3508,
        format: 'png',
        quality: 95
      });

      const thumbnail = await generateThumbnail(optimized, 400);

      const timestamp = Date.now();
      const filename = `variation_${variationType}_${timestamp}`;

      const imageUrl = await uploadToR2(optimized, `sheets/${filename}.png`);
      const thumbnailUrl = await uploadToR2(thumbnail, `thumbnails/${filename}.png`);

      return {
        imageUrl,
        thumbnailUrl,
        prompt: variationPrompt,
        cached: false,
        metadata: {
          technique: 'VARIATION',
          theme: variationType,
          subTheme: '',
          ageGroup: 'ALL',
          difficulty: 3,
          generatedAt: new Date().toISOString(),
          modelVersion: 'gemini-2.0-flash-exp'
        }
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to generate variation:', error);
    return null;
  }
}
