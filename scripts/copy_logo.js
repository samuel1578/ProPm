import fs from 'fs';
import path from 'path';

const root = path.resolve();
const src = path.join(root, 'src', 'assets', 'logo-light.png');
const destDir = path.join(root, 'public');
const dest = path.join(destDir, 'logo-light.png');

if (!fs.existsSync(src)) {
  console.error('Source logo not found:', src);
  process.exit(1);
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(src, dest);
console.log('Copied', src, '->', dest);
