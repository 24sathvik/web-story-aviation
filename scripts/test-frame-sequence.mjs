import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const framesDir = path.resolve(__dirname, '../public/cinematic/frames');

async function run() {
  console.log("Checking frame sequence fidelity...");
  
  if (!fs.existsSync(framesDir)) {
    console.error("❌ frames directory does not exist.");
    process.exit(1);
  }

  const files = fs.readdirSync(framesDir)
    .filter(f => f.startsWith('frame_') && f.endsWith('.webp'))
    .sort(); // Lexicographical sort will match numeric if padded correctly

  console.log(`Found ${files.length} webp frames.`);

  if (files.length !== 240) {
    console.error(`❌ Expected 240 frames, found ${files.length}`);
    process.exit(1);
  }

  let hasError = false;

  for (let i = 1; i <= 240; i++) {
    const padded = i.toString().padStart(4, '0');
    const expectedName = `frame_${padded}.webp`;
    
    if (files[i - 1] !== expectedName) {
      console.error(`❌ Frame mismatch at index ${i}. Expected ${expectedName}, found ${files[i - 1]}`);
      hasError = true;
    }

    const filePath = path.join(framesDir, expectedName);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Missing frame file: ${expectedName}`);
      hasError = true;
      continue;
    }

    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      console.error(`❌ Frame ${expectedName} is 0 bytes (corrupted)`);
      hasError = true;
    }

    if (stats.size < 5000) {
      console.warn(`⚠️ Frame ${expectedName} is surprisingly small (${stats.size} bytes).`);
    }
  }

  if (hasError) {
    console.error("❌ Fidelity audit FAILED.");
    process.exit(1);
  }

  console.log("✅ All 240 frames exist, are chronologically padded, and sequentially complete.");
}

run().catch(console.error);
