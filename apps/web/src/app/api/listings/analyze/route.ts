import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { analyzeShoePhotos } from '@/features/shoe/services/service';

export async function POST(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { imageUrlTop, imageUrlSide, imageUrlSole, imageUrlInsole } = body;

    if (!imageUrlTop || !imageUrlSide || !imageUrlSole || !imageUrlInsole) {
      return NextResponse.json({ error: 'Missing one or more photo URLs' }, { status: 400 });
    }

    const parsedResult = await analyzeShoePhotos({
      top: imageUrlTop,
      side: imageUrlSide,
      sole: imageUrlSole,
      insole: imageUrlInsole,
    });

    return NextResponse.json({ analysis: parsedResult });
  } catch (error: any) {
    console.error('Error analyzing photos:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
