import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { analyzeAndPriceShoe, createShoeAnalysis, InvalidShoePhotoError } from '@/features/shoe/services/service';

export const maxDuration = 60;

export async function POST(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { imageUrlTop, imageUrlLeftSide, imageUrlRightSide, imageUrlSole, imageUrlInsole } = body;

    if (!imageUrlTop || !imageUrlLeftSide || !imageUrlRightSide || !imageUrlSole || !imageUrlInsole) {
      return NextResponse.json({ error: 'Missing one or more photo URLs' }, { status: 400 });
    }

    const analysis = await analyzeAndPriceShoe({
      top: imageUrlTop,
      leftSide: imageUrlLeftSide,
      rightSide: imageUrlRightSide,
      sole: imageUrlSole,
      insole: imageUrlInsole,
    });

    const insertAnalysis = await createShoeAnalysis(analysis);

    return NextResponse.json({ 
      analysis, 
      analysisId: insertAnalysis?.id || 0
    });
  } catch (error: any) {
    if (error instanceof InvalidShoePhotoError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Error analyzing photos:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
