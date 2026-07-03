import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';

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
    const urls: Record<string, string> = {};

    const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!rawSupabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Supabase storage configuration is missing' }, { status: 500 });
    }

    // Storage endpoints hang off the project origin; strip any trailing slash so
    // string-concatenated paths don't produce a `//storage/...` (which routes to
    // PostgREST and fails with PGRST125).
    const supabaseUrl = rawSupabaseUrl.replace(/\/+$/, '');

    for (const [key, file] of Object.entries(files)) {
      const ext = file.name.split('.').pop() || 'jpg';
      const randomPart = Math.random().toString(36).substring(2, 8);
      const filePath = `${currentUser.user.id}/${key}-${Date.now()}-${randomPart}.${ext}`;
      const uploadUrl = `${supabaseUrl}/storage/v1/object/resole-photos/${filePath}`;

      const fileBuffer = await file.arrayBuffer();

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': file.type,
        },
        body: fileBuffer,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to upload ${key} to Supabase:`, errorText);
        return NextResponse.json({ error: `Failed to upload ${key} photo` }, { status: 500 });
      }

      urls[key === 'top' ? 'imageUrlTop' : key === 'side' ? 'imageUrlSide' : key === 'sole' ? 'imageUrlSole' : 'imageUrlInsole'] = 
        `${supabaseUrl}/storage/v1/object/public/resole-photos/${filePath}`;
    }

    return NextResponse.json(urls);
  } catch (error) {
    console.error('Error uploading photos:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
