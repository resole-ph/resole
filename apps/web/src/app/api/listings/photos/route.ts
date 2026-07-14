import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { getAuthenticatedUser } from '@/lib/request-auth';

const MAX_PHOTO_SIZE_BYTES = 20 * 1024 * 1024;
const MAX_PHOTO_SIZE_LABEL = '20MB';

const COMPRESS_MAX_WIDTH = 1600;
const COMPRESS_QUALITY = 80;

async function compressPhoto(file: File): Promise<{ buffer: Buffer; contentType: string; ext: string }> {
  const inputBuffer = Buffer.from(await file.arrayBuffer());

  try {
    const outputBuffer = await sharp(inputBuffer)
      .rotate() 
      .resize({ width: COMPRESS_MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: COMPRESS_QUALITY, progressive: true })
      .toBuffer();

    return { buffer: outputBuffer, contentType: 'image/jpeg', ext: 'jpg' };
  } catch (error) {
    console.error('Photo compression failed, uploading original bytes:', error);
    const ext = file.name.split('.').pop() || 'jpg';
    return { buffer: inputBuffer, contentType: file.type || 'application/octet-stream', ext };
  }
}

export async function POST(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const top = formData.get('top') as File;
    const side = formData.get('side') as File;
    const sole = formData.get('sole') as File;
    const insole = formData.get('insole') as File;

    if (!top || !side || !sole || !insole) {
      return NextResponse.json({ error: 'Missing one or more required photos (top, side, sole, insole)' }, { status: 400 });
    }

    const files = { top, side, sole, insole };

    const oversizedEntries = Object.entries(files).filter(([, file]) => file.size > MAX_PHOTO_SIZE_BYTES);
    if (oversizedEntries.length > 0) {
      const details = oversizedEntries
        .map(([key, file]) => `${key} (${(file.size / (1024 * 1024)).toFixed(1)}MB)`)
        .join(', ');
      return NextResponse.json({
        error: `Photo too large: ${details}. Each photo must be under ${MAX_PHOTO_SIZE_LABEL}.`,
      }, { status: 413 });
    }

    const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!rawSupabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Supabase storage configuration is missing' }, { status: 500 });
    }

    const supabaseUrl = rawSupabaseUrl.replace(/\/+$/, '');

    const urlKeys = {
      top: 'imageUrlTop',
      side: 'imageUrlSide',
      sole: 'imageUrlSole',
      insole: 'imageUrlInsole',
    } as const;

    const uploads = await Promise.all(
      Object.entries(files).map(async ([key, file]) => {
        const { buffer, contentType, ext } = await compressPhoto(file);
        const randomPart = Math.random().toString(36).substring(2, 8);
        const filePath = `${currentUser.user.id}/${key}-${Date.now()}-${randomPart}.${ext}`;
        const uploadUrl = `${supabaseUrl}/storage/v1/object/resole-photos/${filePath}`;

        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': contentType,
          },
          body: new Uint8Array(buffer),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to upload ${key} to Supabase:`, errorText);
          throw new Error(`Failed to upload ${key} photo`);
        }

        return {
          urlKey: urlKeys[key as keyof typeof urlKeys],
          url: `${supabaseUrl}/storage/v1/object/public/resole-photos/${filePath}`,
        };
      })
    );

    const urls = Object.fromEntries(uploads.map(({ urlKey, url }) => [urlKey, url]));

    return NextResponse.json(urls);
  } catch (error) {
    console.error('Error uploading photos:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
