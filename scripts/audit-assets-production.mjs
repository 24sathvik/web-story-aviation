import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

console.log('--- 1. AUDITING 240 WEBP HERO FRAMES ---');
const framesDir = path.join(PUBLIC_DIR, 'cinematic', 'frames');
if (!fs.existsSync(framesDir)) {
  console.error('ERROR: frames directory does not exist:', framesDir);
  process.exit(1);
}

const missingFrames = [];
const corruptFrames = [];
let totalFrameBytes = 0;

for (let i = 1; i <= 240; i++) {
  const padded = i.toString().padStart(4, '0');
  const filename = `frame_${padded}.webp`;
  const filePath = path.join(framesDir, filename);

  if (!fs.existsSync(filePath)) {
    missingFrames.push(filename);
  } else {
    const stat = fs.statSync(filePath);
    if (stat.size === 0) {
      corruptFrames.push(filename);
    }
    totalFrameBytes += stat.size;
  }
}

console.log(`Total hero frames checked: 240`);
console.log(`Missing frames: ${missingFrames.length} ${missingFrames.slice(0, 5)}`);
console.log(`Corrupt / 0-byte frames: ${corruptFrames.length}`);
console.log(`Total hero frames size: ${(totalFrameBytes / (1024 * 1024)).toFixed(2)} MB`);

console.log('\n--- 2. SCANNING SOURCE CODE FOR STATIC ASSET REFERENCES ---');
const srcDir = path.join(ROOT_DIR, 'src');

function getAllFiles(dir, exts = ['.ts', '.tsx', '.js', '.jsx', '.json']) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath, exts));
    } else if (exts.includes(path.extname(file))) {
      results.push(filePath);
    }
  }
  return results;
}

const sourceFiles = getAllFiles(srcDir);
const assetUrlRegex = /(?:["'`])(\/(?:images|cinematic|textures|fonts|audio|video)\/[^"'`\s]+)(?:["'`])/g;
const referencedAssets = new Set();
const absolutePathWarnings = [];

for (const file of sourceFiles) {
  const content = fs.readFileSync(file, 'utf8');

  // Check for local file system paths
  if (content.includes('C:\\') || content.includes('file:///') || content.includes('/Users/')) {
    // Only check if it's not a comment or known benign
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if ((line.includes('C:\\') || line.includes('file:///')) && !line.trim().startsWith('//')) {
        absolutePathWarnings.push({ file: path.relative(ROOT_DIR, file), line: idx + 1, content: line.trim() });
      }
    });
  }

  let match;
  while ((match = assetUrlRegex.exec(content)) !== null) {
    referencedAssets.add(match[1]);
  }
}

console.log(`Referenced public assets found in source code: ${referencedAssets.size}`);
const missingReferencedAssets = [];

for (const assetPath of referencedAssets) {
  // Strip query params if any
  const cleanPath = assetPath.split('?')[0];
  const diskPath = path.join(PUBLIC_DIR, cleanPath.replace(/^\//, '').replace(/\//g, path.sep));

  if (!fs.existsSync(diskPath)) {
    missingReferencedAssets.push(cleanPath);
  }
}

console.log(`Missing referenced assets: ${missingReferencedAssets.length}`);
if (missingReferencedAssets.length > 0) {
  console.warn('MISSING ASSETS:', missingReferencedAssets);
}

console.log(`Absolute path warnings: ${absolutePathWarnings.length}`);
if (absolutePathWarnings.length > 0) {
  console.warn('ABSOLUTE PATHS FOUND:', absolutePathWarnings);
}

console.log('\n--- 3. CHECKING CASE-SENSITIVITY ON DISK ---');
let caseMismatches = 0;
for (const assetPath of referencedAssets) {
  const cleanPath = assetPath.split('?')[0];
  const segments = cleanPath.replace(/^\//, '').split('/');
  let currentDir = PUBLIC_DIR;

  for (const segment of segments) {
    if (!fs.existsSync(currentDir)) break;
    const entries = fs.readdirSync(currentDir);
    const exactMatch = entries.find(e => e === segment);
    const caseInsensitiveMatch = entries.find(e => e.toLowerCase() === segment.toLowerCase());

    if (!exactMatch && caseInsensitiveMatch) {
      console.warn(`CASE MISMATCH: requested "${segment}" but found "${caseInsensitiveMatch}" in ${currentDir}`);
      caseMismatches++;
    }
    currentDir = path.join(currentDir, segment);
  }
}
console.log(`Total case mismatches: ${caseMismatches}`);

console.log('\n--- ASSET AUDIT COMPLETED ---');
