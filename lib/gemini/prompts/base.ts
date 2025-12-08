import { ART_TECHNIQUES, TECHNIQUE_PROMPT_HINTS, TechniqueId } from '../../constants/artTechniques';
import { AGE_GROUPS, AgeGroupId } from '../../constants/ageGroups';
import { THEMES, ThemeId } from '../../constants/themes';

export interface PromptOptions {
  technique: string;
  theme: string;
  subTheme: string;
  ageGroup: string;
  difficulty: number;
  style?: string;
  additionalDetails?: string;
}

export function generateArtSheetPrompt(options: PromptOptions): string {
  const technique = ART_TECHNIQUES[options.technique as TechniqueId];
  const ageGroup = AGE_GROUPS[options.ageGroup as AgeGroupId];
  const themeData = THEMES[options.theme as ThemeId];

  const techniqueHint = TECHNIQUE_PROMPT_HINTS[options.technique as TechniqueId] || '';

  const lineWeight = getLineWeight(ageGroup?.lineThickness || 'medium');
  const complexity = getComplexityDescription(options.difficulty);

  const prompt = `
Create a high-quality printable art worksheet for children.

**Style Requirements:**
- Black and white line art only (no colors, no grayscale shading)
- Clean, crisp lines suitable for printing at 300 DPI
- Line weight: ${lineWeight}
- Professional quality for educational use
- A4 paper ratio (210mm × 297mm)
- Leave appropriate margins for printing

**Content:**
- Theme: ${themeData?.nameKo || options.theme} - ${options.subTheme}
- Art Technique: ${technique?.nameKo || options.technique}
- ${techniqueHint}

**Age Group Specifications:**
- Target: ${ageGroup?.nameKo || options.ageGroup} (${ageGroup?.ageRange || 'All ages'})
- Complexity: ${complexity}
- Detail Level: ${ageGroup?.detailLevel || 'medium'}
- Number of elements: ${ageGroup?.generationParams?.objectCount?.min || 2}-${ageGroup?.generationParams?.objectCount?.max || 5}

**Difficulty Level ${options.difficulty}/5:**
${getDifficultyDescription(options.difficulty)}

${options.style ? `**Style Preference:** ${options.style}` : ''}
${options.additionalDetails ? `**Additional Details:** ${options.additionalDetails}` : ''}

**Output:**
Generate a single, complete art worksheet image ready for printing. The image should be clear, educational, and engaging for children of the specified age group.
`.trim();

  return prompt;
}

function getLineWeight(thickness: string): string {
  switch (thickness) {
    case 'thick': return '4-6px thick, bold lines easy for young children to see and follow';
    case 'medium': return '2-4px medium lines, clear but not overwhelming';
    case 'thin': return '1-2px fine lines for detailed work';
    default: return '2-3px standard lines';
  }
}

function getComplexityDescription(difficulty: number): string {
  switch (difficulty) {
    case 1: return 'Very simple - large shapes, minimal details, perfect for beginners';
    case 2: return 'Simple - basic shapes with some details, suitable for developing skills';
    case 3: return 'Moderate - balanced complexity with clear structure';
    case 4: return 'Detailed - intricate patterns, multiple elements';
    case 5: return 'Complex - highly detailed, challenging composition';
    default: return 'Moderate complexity';
  }
}

function getDifficultyDescription(difficulty: number): string {
  const descriptions: Record<number, string> = {
    1: `
- Very large, simple shapes
- Maximum 3 main elements
- Extra thick outlines
- No small details
- Lots of white space`,
    2: `
- Large shapes with basic details
- 3-5 main elements
- Thick outlines
- Minimal patterns
- Clear focal point`,
    3: `
- Medium-sized elements
- 4-6 elements with moderate detail
- Standard line weight
- Some patterns or textures
- Balanced composition`,
    4: `
- Smaller, detailed elements
- 5-8 elements
- Varied line weights
- Multiple patterns
- Complex composition`,
    5: `
- Fine details throughout
- 6-10+ elements
- Thin, precise lines
- Intricate patterns
- Professional-level complexity`
  };

  return descriptions[difficulty] || descriptions[3];
}

export function generateVariationPrompt(basePrompt: string, variationType: string): string {
  const variationModifiers: Record<string, string> = {
    'pose': 'with a different pose or position',
    'angle': 'from a different viewing angle',
    'style': 'with a slightly different artistic style',
    'elements': 'with different background elements',
    'composition': 'with an alternative composition layout'
  };

  return `${basePrompt}\n\n**Variation:** Create this ${variationModifiers[variationType] || 'with unique variations'}`;
}

export function generateCurriculumRecommendationPrompt(
  ageGroup: string,
  weeks: number,
  goals: string[]
): string {
  const ageGroupData = AGE_GROUPS[ageGroup as AgeGroupId];

  return `
You are an expert art educator. Create a ${weeks}-week art curriculum for ${ageGroupData?.nameKo || ageGroup} (${ageGroupData?.ageRange || 'various ages'}).

Learning Goals:
${goals.map((g, i) => `${i + 1}. ${g}`).join('\n')}

Requirements:
- Each week should have 2-3 activities
- Progress from simpler to more complex techniques
- Include variety in techniques and themes
- Consider seasonal/holiday activities when appropriate
- Provide specific materials needed
- Include learning objectives for each activity

Available Techniques:
${Object.entries(ART_TECHNIQUES)
  .filter(([_, t]) => t.ageGroups.includes(ageGroup))
  .map(([id, t]) => `- ${t.nameKo} (${id})`)
  .join('\n')}

Return the curriculum in JSON format with this structure:
{
  "weeks": [
    {
      "week": 1,
      "theme": "주제",
      "activities": [
        {
          "day": 1,
          "technique": "TECHNIQUE_ID",
          "theme": "THEME_ID",
          "subTheme": "subtheme_id",
          "title": "활동 제목",
          "difficulty": 1-5,
          "duration": minutes,
          "materials": ["재료1", "재료2"],
          "objectives": ["목표1", "목표2"],
          "notes": "선생님을 위한 팁"
        }
      ]
    }
  ]
}
`.trim();
}

export function generateArtFeedbackPrompt(
  artworkDescription: string,
  technique: string,
  ageGroup: string
): string {
  const techniqueData = ART_TECHNIQUES[technique as TechniqueId];
  const ageGroupData = AGE_GROUPS[ageGroup as AgeGroupId];

  return `
You are a friendly and encouraging art teacher providing feedback on a child's artwork.

Student Level: ${ageGroupData?.nameKo || ageGroup} (${ageGroupData?.ageRange || ''})
Art Technique: ${techniqueData?.nameKo || technique}
Expected Skills: ${techniqueData?.skills?.join(', ') || 'various art skills'}

Artwork Description:
${artworkDescription}

Please provide feedback in Korean that is:
1. Age-appropriate and encouraging
2. Specific about what was done well
3. Gentle suggestions for improvement
4. Fun and motivating

Return in JSON format:
{
  "strengths": ["잘한 점 1", "잘한 점 2"],
  "improvements": ["개선할 점 1"],
  "nextSteps": ["다음 단계 1"],
  "encouragement": "격려 메시지",
  "emoji": "관련 이모지"
}
`.trim();
}
