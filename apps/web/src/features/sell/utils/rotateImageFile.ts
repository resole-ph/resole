export type RotateDirection = 'cw' | 'ccw';

export async function rotateImageFile(file: File, direction: RotateDirection): Promise<File> {
  const bitmap = await createImageBitmap(file);

  const canvas = document.createElement('canvas');
  canvas.width = bitmap.height;
  canvas.height = bitmap.width;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new Error('Canvas 2D context unavailable');
  }

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((direction === 'cw' ? 90 : -90) * (Math.PI / 180));
  ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
  bitmap.close();

  const mimeType = file.type || 'image/jpeg';
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mimeType));
  if (!blob) throw new Error('Failed to encode rotated image');

  return new File([blob], file.name, { type: blob.type });
}
