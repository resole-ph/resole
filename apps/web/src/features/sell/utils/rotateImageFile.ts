export type RotateDirection = 'cw' | 'ccw';

const MAX_ROTATED_DIMENSION = 1600;
const ROTATED_JPEG_QUALITY = 0.85;

export async function rotateImageFile(file: File, direction: RotateDirection): Promise<File> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });

  try {
    const scale = Math.min(1, MAX_ROTATED_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const drawWidth = Math.round(bitmap.width * scale);
    const drawHeight = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = drawHeight;
    canvas.height = drawWidth;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((direction === 'cw' ? 90 : -90) * (Math.PI / 180));
    ctx.drawImage(bitmap, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', ROTATED_JPEG_QUALITY)
    );
    if (!blob) throw new Error('Failed to encode rotated image');

    const name = file.name.replace(/\.\w+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg' });
  } finally {
    bitmap.close();
  }
}
