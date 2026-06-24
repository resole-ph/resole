import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { GoogleGenAI } from '@google/genai';

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

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Google API key is not configured' }, { status: 500 });
    }

    const imageParts: Array<{ inlineData: { mimeType: string; data: string } }> = [];
    const photoUrls = {
      top: imageUrlTop,
      side: imageUrlSide,
      sole: imageUrlSole,
      insole: imageUrlInsole,
    };

    for (const [key, url] of Object.entries(photoUrls)) {
      const res = await fetch(url);
      if (!res.ok) {
        return NextResponse.json({ error: `Failed to download ${key} image from URL` }, { status: 400 });
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      const base64 = buffer.toString('base64');
      const contentType = res.headers.get('content-type') || 'image/jpeg';

      imageParts.push({
        inlineData: {
          mimeType: contentType,
          data: base64,
        },
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = 'Analyze these four photos of a shoe representing its top, side, sole, and insole. Accurately identify the brand, model, provide a description outlining its wear, condition, and visible defects, estimate a condition score from 1 to 10 (where 10 is brand new), and suggest a fair resale pricing value in PHP (Philippine Peso) based on its current condition.';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [prompt, ...imageParts],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            brand: { type: 'STRING' },
            model: { type: 'STRING' },
            conditionScore: { type: 'NUMBER' },
            description: { type: 'STRING' },
            estimatedPrice: { type: 'NUMBER' },
          },
          required: ['brand', 'model', 'conditionScore', 'description', 'estimatedPrice'],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      return NextResponse.json({ error: 'Failed to generate content from AI model' }, { status: 500 });
    }

    const parsedResult = JSON.parse(resultText);

    return NextResponse.json({ analysis: parsedResult });
  } catch (error) {
    console.error('Error analyzing photos:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
