import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateArtSheets } from '@/lib/gemini/imageGenerator';
import { ART_TECHNIQUES } from '@/lib/constants/artTechniques';
import { THEMES } from '@/lib/constants/themes';
import { AGE_GROUPS } from '@/lib/constants/ageGroups';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      technique,
      theme,
      subTheme,
      ageGroup,
      prompt,
      complexity = 50,
      quantity = 1,
      paperSize = 'A4',
      orientation = 'portrait',
      includeInstructions = true,
      includeWatermark = false,
    } = body;

    // Validate required fields
    if (!technique || !theme || !ageGroup) {
      return NextResponse.json(
        { error: '필수 항목을 모두 입력해주세요' },
        { status: 400 }
      );
    }

    // Validate technique
    if (!ART_TECHNIQUES[technique as keyof typeof ART_TECHNIQUES]) {
      return NextResponse.json(
        { error: '유효하지 않은 기법입니다' },
        { status: 400 }
      );
    }

    // Validate theme
    if (!THEMES[theme as keyof typeof THEMES]) {
      return NextResponse.json(
        { error: '유효하지 않은 테마입니다' },
        { status: 400 }
      );
    }

    // Validate age group
    if (!AGE_GROUPS[ageGroup as keyof typeof AGE_GROUPS]) {
      return NextResponse.json(
        { error: '유효하지 않은 연령대입니다' },
        { status: 400 }
      );
    }

    // Get subscription and check credits
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
    });

    const credits = subscription?.credits || 0;

    if (credits < quantity) {
      return NextResponse.json(
        { error: `크레딧이 부족합니다. 필요: ${quantity}, 보유: ${credits}` },
        { status: 402 }
      );
    }

    // Generate art sheets
    const generatedSheets = await generateArtSheets({
      technique,
      theme,
      subTheme,
      ageGroup,
      difficulty: Math.ceil(complexity / 20), // Convert 0-100 to 1-5
      additionalDetails: prompt,
      count: quantity,
    });

    // Deduct credits
    if (subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { credits: credits - quantity },
      });
    }

    // Save sheets to database
    const savedSheets = await Promise.all(
      generatedSheets.map((sheet, index) =>
        prisma.sheet.create({
          data: {
            userId: session.user.id,
            title: `${THEMES[theme as keyof typeof THEMES]?.nameKo || theme} - ${subTheme || ''} #${index + 1}`.trim(),
            technique,
            theme,
            subTheme,
            ageGroup,
            prompt: sheet.prompt,
            imageUrl: sheet.imageUrl,
            thumbnailUrl: sheet.thumbnailUrl,
            complexity,
            paperSize,
            orientation,
            includeInstructions,
            includeWatermark,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      sheets: generatedSheets,
      savedSheets,
      creditsRemaining: credits - quantity,
    });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: '도안 생성 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
