const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const targetDir = path.join(__dirname, 'src');

walkDir(targetDir, function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Clean up duplicated/messy text classes
    content = content.replace(/ dark:text-black\/40 dark:text-white\/40/g, '');
    content = content.replace(/ dark:text-black\/40 dark:text-white\/60/g, '');
    content = content.replace(/ dark:text-white dark:text-white/g, ' dark:text-white');
    
    // Clean up duplicated border classes
    content = content.replace(/ dark:border-black\/10 dark:border-white\/10/g, '');

    // Clean up duplicated background classes
    // Replace sequences where both are present
    content = content.replace(/ dark:bg-white\/5 dark:bg-\[\#0b0f19\]/g, '');
    content = content.replace(/ dark:bg-black\/80 dark:bg-white\/10/g, '');
    content = content.replace(/ dark:bg-white\/10 dark:bg-\[\#0b0f19\]/g, '');
    
    // Replace standalone dark:bg-[#0b0f19] to neutral-900 or neutral-950 depending on context
    // Actually, in tool UI files, it should probably be neutral-950 or just not be there if the element already has a dark mode background.
    // E.g., `bg-white dark:bg-[#0b0f19]` => `bg-white dark:bg-neutral-950`
    content = content.replace(/ bg-white dark:bg-\[\#0b0f19\]/g, ' bg-white dark:bg-neutral-950');
    // E.g., inputs: `bg-black\/5 dark:bg-\[\#0b0f19\]` => `bg-black\/5 dark:bg-neutral-900`
    content = content.replace(/ bg-black\/5 dark:bg-\[\#0b0f19\]/g, ' bg-black/5 dark:bg-neutral-900');

    // Clean up double spaces in class names without breaking newlines
    content = content.replace(/className="([^"]+)"/g, (match, p1) => {
        return `className="${p1.replace(/\s+/g, ' ').trim()}"`;
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
