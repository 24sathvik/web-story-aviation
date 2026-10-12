import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const framesDir = path.resolve(__dirname, '../public/cinematic/frames');

async function run() {
  console.log("Analyzing adjacent frame motion...");
  
  const files = fs.readdirSync(framesDir)
    .filter(f => f.startsWith('frame_') && f.endsWith('.webp'))
    .sort();

  if (files.length === 0) {
    console.error("No frames found.");
    process.exit(1);
  }

  const differences = [];
  let prevBuffer = null;
  let maxRun = 0;
  let currentRun = 0;
  let duplicates = 0;

  console.log("Reading and comparing frames (this might take a minute)...");

  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(framesDir, files[i]);
    // Get raw RGB buffer
    const { data } = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });

    if (prevBuffer) {
      let diffSum = 0;
      // Calculate Mean Absolute Difference (MAD)
      for (let j = 0; j < data.length; j += 4) { // Sample every 4th pixel to speed up
        diffSum += Math.abs(data[j] - prevBuffer[j]);
      }
      
      const meanDiff = diffSum / (data.length / 4);
      differences.push(meanDiff);

      // If mean absolute difference is very low, it's a near duplicate
      if (meanDiff < 2.0) { // arbitrary threshold for near-identical
        duplicates++;
        currentRun++;
        if (currentRun > maxRun) maxRun = currentRun;
      } else {
        currentRun = 0;
      }
    }
    prevBuffer = data;
    if (i % 24 === 0) process.stdout.write(`\rProcessed ${i}/${files.length} frames`);
  }
  
  console.log(`\n\n--- MOTION ANALYSIS ---`);
  
  const mean = differences.reduce((a, b) => a + b, 0) / differences.length;
  const sorted = [...differences].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  console.log(`Mean adjacent difference: ${mean.toFixed(2)}`);
  console.log(`Median adjacent difference: ${median.toFixed(2)}`);
  console.log(`Minimum difference: ${min.toFixed(2)}`);
  console.log(`Maximum difference: ${max.toFixed(2)}`);
  console.log(`Near-duplicate count: ${duplicates}`);
  console.log(`Longest static run: ${maxRun}`);

  const report = {
    mean, median, min, max, duplicates, maxRun, differences
  };

  fs.writeFileSync(path.join(__dirname, 'frame_motion_report.json'), JSON.stringify(report, null, 2));
  console.log("Report written to frame_motion_report.json");
}

run().catch(console.error);
