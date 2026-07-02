import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-cpu';
import fs from 'fs';
import path from 'path';

let model: any = null;
let tflite: any = null;

export async function loadModel() {
  if (model) return model;

  if (typeof self === 'undefined') {
    (global as any).self = global;
  }

  if (!tflite) {
    tflite = require('@tensorflow/tfjs-tflite');
  }

  const modelPath = path.join(process.cwd(), 'src/features/shoe/models/best_float16.tflite');
  const modelBuffer = fs.readFileSync(modelPath);
  
  model = await tflite.loadTFLiteModel(modelBuffer.buffer.slice(modelBuffer.byteOffset, modelBuffer.byteOffset + modelBuffer.byteLength));
  return model;
}

export async function detectIfShoe(imageBuffer: Buffer): Promise<boolean> {
  const loadedModel = await loadModel();
  const tfnode = require('@tensorflow/tfjs-node');

  let tensor;
  try {
    tensor = tfnode.node.decodeImage(imageBuffer);
  } catch (error) {
    throw new Error('Failed to decode image');
  }

  const resized = tf.image.resizeBilinear(tensor, [224, 224]);
  const expanded = resized.expandDims(0);
  const normalized = expanded.div(255.0);

  const prediction = loadedModel.predict(normalized) as tf.Tensor;
  const scores = await prediction.data();

  tf.dispose([tensor, resized, expanded, normalized, prediction]);

  const shoeScore = scores[0]; 
  return shoeScore > 0.5;
}
