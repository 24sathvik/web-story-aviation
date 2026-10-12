import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sourceVideo = path.join(__dirname, '../public/cinematic/video/cinematic-master.mp4');

ffmpeg.setFfmpegPath(ffmpegStatic);

// Since ffprobe is not static we need to find it or we can just use fluent-ffmpeg to try
// But fluent-ffmpeg requires ffprobe on system path. 
// Let's use ffprobe-static if it's installed.
try {
  const ffprobeStatic = await import('ffprobe-static');
  ffmpeg.setFfprobePath(ffprobeStatic.default.path);
} catch (e) {
  console.log("No ffprobe-static installed, will try raw ffmpeg to get duration");
}

ffmpeg.ffprobe(sourceVideo, (err, metadata) => {
  if (err) {
    console.error('Error probing video:', err.message);
    process.exit(1);
  }
  const stream = metadata.streams.find(s => s.codec_type === 'video');
  console.log('--- METADATA ---');
  console.log('Duration:', stream.duration, 'seconds');
  console.log('r_frame_rate:', stream.r_frame_rate);
  console.log('avg_frame_rate:', stream.avg_frame_rate);
  console.log('nb_frames:', stream.nb_frames || 'N/A');
  console.log('time_base:', stream.time_base);
});
