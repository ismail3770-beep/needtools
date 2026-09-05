const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'tools-logic');

function safeReplaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace primary button backgrounds and hovers
  const bgColors = ['emerald', 'brand', 'violet', 'rose', 'blue'];
  
  bgColors.forEach(color => {
    // Replace bg-X-600
    const bgRegex = new RegExp(`bg-${color}-600`, 'g');
    content = content.replace(bgRegex, 'bg-black dark:bg-white');
    
    // Replace hover:bg-X-500 or hover:bg-X-700
    const hoverRegex = new RegExp(`hover:bg-${color}-(500|700)`, 'g');
    content = content.replace(hoverRegex, 'hover:bg-black/90 dark:hover:bg-white/90');
    
    // Replace shadows
    const shadowRegex = new RegExp(`shadow-${color}-(500|600)\\/[0-9]+`, 'g');
    content = content.replace(shadowRegex, 'shadow-sm');
  });

  // Since we replaced the bg to black/white, the text-white inside these buttons needs to be text-white dark:text-black.
  // Instead of blindly replacing text-white, let's fix it where it appears next to font-bold or font-semibold, 
  // which are typical button classes.
  // Also, we can just look for instances where it might be broken.
  // Wait, my previous script did: 
  // content = content.replace(/text-white shadow-sm/g, 'text-white dark:text-black shadow-sm');
  // Let's do a more robust replace for buttons:
  
  // A button class string often looks like: "... text-white font-bold ..."
  // Let's replace "text-white font-bold" with "text-white dark:text-black font-bold"
  content = content.replace(/text-white font-bold/g, 'text-white dark:text-black font-bold');
  content = content.replace(/text-white font-semibold/g, 'text-white dark:text-black font-semibold');
  content = content.replace(/text-white font-extrabold/g, 'text-white dark:text-black font-extrabold');

  // Let's also fix disabled states
  content = content.replace(/disabled:bg-slate-300 dark:disabled:bg-slate-700/g, 'disabled:bg-black/10 dark:disabled:bg-white/10 disabled:text-black/40 dark:disabled:text-white/40');

  if (originalContent !== content) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function processDirectorySafely(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectorySafely(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      safeReplaceInFile(fullPath);
    }
  }
}

processDirectorySafely(directoryPath);
