const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'tools-logic');

function safeReplaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Backgrounds
  content = content.replace(/bg-slate-50/g, 'bg-black/5 dark:bg-white/5');
  content = content.replace(/bg-slate-100/g, 'bg-black/10 dark:bg-white/10');
  content = content.replace(/bg-slate-800/g, 'bg-black/80 dark:bg-white/10');
  content = content.replace(/bg-slate-900\/50/g, 'bg-white/5');
  content = content.replace(/bg-slate-900/g, 'bg-neutral-950');

  // Borders
  content = content.replace(/border-slate-200/g, 'border-black/10 dark:border-white/10');
  content = content.replace(/border-slate-300/g, 'border-black/20 dark:border-white/20');
  content = content.replace(/border-slate-700/g, 'border-black/10 dark:border-white/10');
  content = content.replace(/border-slate-800/g, 'border-black/10 dark:border-white/10');

  // Text
  content = content.replace(/text-slate-400/g, 'text-black/40 dark:text-white/40');
  content = content.replace(/text-slate-500/g, 'text-black/50 dark:text-white/50');
  content = content.replace(/text-slate-600/g, 'text-black/60 dark:text-white/60');
  content = content.replace(/text-slate-700/g, 'text-black/70 dark:text-white/70');
  content = content.replace(/text-slate-900/g, 'text-black dark:text-white');

  // Buttons (Primary blue to black/white)
  content = content.replace(/bg-blue-600/g, 'bg-black dark:bg-white');
  content = content.replace(/hover:bg-blue-700/g, 'hover:bg-black/90 dark:hover:bg-white/90');
  
  // Safely replace text-white inside button classes
  content = content.replace(/text-white shadow-sm/g, 'text-white dark:text-black shadow-sm');
  
  // Focus rings
  content = content.replace(/focus:ring-blue-500\/20/g, 'focus:ring-black/20 dark:focus:ring-white/20');
  content = content.replace(/focus:border-blue-500/g, 'focus:border-black/40 dark:focus:border-white/40');

  // Hovers
  content = content.replace(/hover:bg-slate-100/g, 'hover:bg-black/10 dark:hover:bg-white/10');
  content = content.replace(/hover:bg-slate-200/g, 'hover:bg-black/20 dark:hover:bg-white/20');
  content = content.replace(/hover:bg-slate-800/g, 'hover:bg-white/10');
  content = content.replace(/hover:border-slate-300/g, 'hover:border-black/30 dark:hover:border-white/30');

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
