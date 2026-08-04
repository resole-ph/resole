import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { eq } from 'drizzle-orm';
import { db, sql } from '../src/config/db';
import { charity } from '../src/db/schema';

const BUCKET = 'charity-images';

const CHARITY_IMAGES = [
  { name: 'Gawad Kalinga', fileName: 'charity-gawad-kalinga.jpg', contentType: 'image/jpeg' },
  { name: 'Philippine Red Cross', fileName: 'charity-red-cross.png', contentType: 'image/png' },
  { name: 'WWF Philippines', fileName: 'charity-wwf.jpg', contentType: 'image/jpeg' },
  { name: 'UNICEF Philippines', fileName: 'charity-unicef.png', contentType: 'image/png' },
  { name: 'Caritas Philippines', fileName: 'charity-caritas.png', contentType: 'image/png' },
  { name: 'Save the Children', fileName: 'charity-save-children.png', contentType: 'image/png' },
] as const;

async function uploadImages() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!rawUrl || !serviceRoleKey) {
    throw new Error('Supabase storage configuration is missing.');
  }

  const supabaseUrl = rawUrl.replace(/\/+$/, '');
  const existing = await db.select({ name: charity.name }).from(charity);
  const existingNames = new Set(existing.map((item) => item.name));
  const missing = CHARITY_IMAGES.filter((item) => !existingNames.has(item.name));
  if (missing.length) {
    console.warn(`No matching records yet: ${missing.map((item) => item.name).join(', ')}`);
  }

  for (const item of CHARITY_IMAGES) {
    const buffer = await readFile(resolve('public', item.fileName));
    const metadata = await sharp(buffer).metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error(`${item.fileName} is not a valid image.`);
    }

    const objectUrl = `${supabaseUrl}/storage/v1/object/${BUCKET}/${encodeURIComponent(item.fileName)}`;
    const response = await fetch(objectUrl, {
      method: 'POST',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': item.contentType,
        'x-upsert': 'true',
      },
      body: new Uint8Array(buffer),
    });
    if (!response.ok) {
      throw new Error(`Failed to upload ${item.fileName}: ${await response.text()}`);
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(item.fileName)}`;
    const updated = await db
      .update(charity)
      .set({ image: publicUrl })
      .where(eq(charity.name, item.name))
      .returning({ id: charity.id });
    console.log(`Uploaded ${item.name}${updated.length ? ' and updated its record' : ''}.`);
  }
}

uploadImages()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
