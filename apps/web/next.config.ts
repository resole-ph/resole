import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    '@tensorflow/tfjs-core',
    '@tensorflow/tfjs-node',
    '@tensorflow/tfjs-tflite',
    '@tensorflow/tfjs-backend-wasm',
    '@mapbox/node-pre-gyp',
    'aws-sdk',
    'mock-aws-s3',
    'nock',
    'puppeteer',
    'puppeteer-extra',
    'puppeteer-extra-plugin-stealth'
  ],
};

export default nextConfig;
