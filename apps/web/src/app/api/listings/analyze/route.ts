import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { analyzeAndPriceShoe, createShoeAnalysis, InvalidShoePhotoError } from '@/features/shoe/services/service';

export const maxDuration = 60;

export async function POST(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json(
      { error: 'Please sign in again to analyze your photos — your session has expired.' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const {
      imageUrlTop,
      imageUrlLeftSide,
      imageUrlRightSide,
      imageUrlSole,
      imageUrlInsoleRight,
      imageUrlInsoleLeft,
      imageUrlInsole,
    } = body;

    const insoleRight = imageUrlInsoleRight || imageUrlInsole;
    const insoleLeft = imageUrlInsoleLeft || imageUrlInsole;

    if (!imageUrlTop || !imageUrlLeftSide || !imageUrlRightSide || !imageUrlSole || !insoleRight || !insoleLeft) {
      return NextResponse.json(
        { error: 'Some of your photos are still missing. Please go back and make sure all 6 slots are filled.' },
        { status: 400 }
      );
    }

    const analysis = await analyzeAndPriceShoe({
      top: imageUrlTop,
      leftSide: imageUrlLeftSide,
      rightSide: imageUrlRightSide,
      sole: imageUrlSole,
      insoleRight,
      insoleLeft,
    });

    const insertAnalysis = await createShoeAnalysis(analysis);

    return NextResponse.json({ 
      analysis, 
      analysisId: insertAnalysis?.id || 0
    });
  } catch (error) {
    if (error instanceof InvalidShoePhotoError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    // Internal failures (missing API key, image download, Gemini outage) are logged in full but
    // never echoed to the seller — those messages mean nothing to them and can leak config details.
    console.error('Error analyzing photos:', error);
    return NextResponse.json(
      { error: "We couldn't analyze your photos just now. Please go back and try again in a moment." },
      { status: 500 }
    );
  }
}
