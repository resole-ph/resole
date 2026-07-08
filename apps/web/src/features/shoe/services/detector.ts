import * as ort from 'onnxruntime-node';
import { Jimp } from 'jimp';
import path from 'path';

let session: ort.InferenceSession | null = null;

export async function loadModel() {
  if (session) return session;

  const modelPath = path.join(process.cwd(), 'src/features/shoe/models/best.onnx');
  session = await ort.InferenceSession.create(modelPath);
  return session;
}

export async function detectIfShoe(imageBuffer: Buffer): Promise<boolean> {
  const loadedSession = await loadModel();

  const image = await Jimp.read(imageBuffer);
  image.resize({ w: 768, h: 768 });

  const dims = [1, 3, 768, 768];
  const size = 3 * 768 * 768;
  const float32Data = new Float32Array(size);

  let rOffset = 0;
  let gOffset = 768 * 768;
  let bOffset = 2 * 768 * 768;

  for (let y = 0; y < 768; y++) {
    for (let x = 0; x < 768; x++) {
      const idx = (image.bitmap.width * y + x) << 2;
      float32Data[rOffset++] = image.bitmap.data[idx] / 255.0;
      float32Data[gOffset++] = image.bitmap.data[idx + 1] / 255.0;
      float32Data[bOffset++] = image.bitmap.data[idx + 2] / 255.0;
    }
  }

  const tensor = new ort.Tensor('float32', float32Data, dims);
  const inputName = loadedSession.inputNames[0];
  const feeds: Record<string, ort.Tensor> = {};
  feeds[inputName] = tensor;

  const results = await loadedSession.run(feeds);
  const outputName = loadedSession.outputNames[0];
  const outputData = results[outputName].data as Float32Array;

  let maxScore = 0;
  const scoreStartIndex = 4 * 12096;
  const scoreEndIndex = 5 * 12096;
  
  for (let i = scoreStartIndex; i < scoreEndIndex; i++) {
    if (outputData[i] > maxScore) {
      maxScore = outputData[i];
    }
  }

  console.log(`[ONNX] Highest shoe confidence detected: ${(maxScore * 100).toFixed(2)}%`);
  // bypass the ONNX model so everything goes straight to Gemini
  return true;
}
