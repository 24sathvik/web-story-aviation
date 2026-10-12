import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure ffmpeg to use the downloaded static binary
ffmpeg.setFfmpegPath(ffmpegStatic);

const sourceVideo = path.join(__dirname, '../public/cinematic/video/cinematic-master.mp4');
const outputDir = path.join(__dirname, '../public/cinematic/frames');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
} else {
  // Clear existing frames
  const files = fs.readdirSync(outputDir);
  for (const file of files) {
    fs.unlinkSync(path.join(outputDir, file));
  }
}

console.log(`Starting frame extraction from: ${sourceVideo}`);
console.log(`Output directory: ${outputDir}`);
console.log(`Format: WebP (quality: 80)`);

ffmpeg(sourceVideo)
  .outputOptions([
    '-c:v libwebp',
    '-q:v 80',
    '-pix_fmt yuv420p',
  ])
  // We want to keep original framerate (e.g. 24fps)
  // Extracting to zero-padded files
  .output(path.join(outputDir, 'frame_%04d.webp'))
  .on('start', (cmd) => {
    console.log('FFmpeg process started...');
  })
  .on('progress', (progress) => {
    if (progress.frames) {
      process.stdout.write(`\rExtracted frames: ${progress.frames}`);
    }
  })
  .on('end', () => {
    console.log('\n\nExtraction complete!');
    
    // Calculate stats
    const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.webp'));
    let totalSize = 0;
    let largestSize = 0;
    
    files.forEach(file => {
      const stats = fs.statSync(path.join(outputDir, file));
      totalSize += stats.size;
      if (stats.size > largestSize) largestSize = stats.size;
    });

    const averageSize = totalSize / files.length;

    console.log('--- FRAME STATISTICS ---');
    console.log(`Extracted Frame Count: ${files.length}`);
    console.log(`Average Frame Size: ${(averageSize / 1024).toFixed(2)} KB`);
    console.log(`Largest Frame Size: ${(largestSize / 1024).toFixed(2)} KB`);
    console.log(`Total Sequence Size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  })
  .on('error', (err) => {
    console.error('\nError during extraction:', err.message);
    process.exit(1);
  })
  .run();
