// setupUploads.mjs (or setupUploads.js if "type": "module" in package.json)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Recreate __dirname and __filename (since they're not available in ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create upload directories
const directories = [
  'public/uploads',
  'public/uploads/videos',
  'public/uploads/thumbnails'
];

for (const dir of directories) {
  const dirPath = path.join(process.cwd(), dir);
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
    
    // Create .gitkeep file
    fs.writeFileSync(path.join(dirPath, '.gitkeep'), '');
    console.log(`✅ Created .gitkeep in: ${dir}`);
  } else {
    console.log(`✓ Directory already exists: ${dir}`);
  }
}

console.log('\n🎉 Upload directories setup complete!');
console.log('You can now upload videos to your application.');
