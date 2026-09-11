const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('src/tools-logic');
let patched = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('onDrop') && content.includes('handleFiles')) {
    if (!content.includes('CloudImportButtons')) {
      const importLine = 'import { CloudImportButtons } from "@/components/ui/CloudImportButtons";\n';
      // Add import right after the last import
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const nextLine = content.indexOf('\n', lastImportIndex) + 1;
        content = content.slice(0, nextLine) + importLine + content.slice(nextLine);
      } else {
        content = importLine + content;
      }

      // Add component before the closing div of the dropzone
      // Let's find `<input ... className="hidden" />` or similar and append near the end of dropzone.
      // Usually there is a "Choose ... Files" button in a `div` or `span`.
      // The dropzone has `onDrop` property.
      // We can look for `<span className="inline-flex items-center gap-2 px-8 py-3.5 bg-black` or similar.
      // Or we can just look for the first `<input` inside the dropzone, then skip to the end.
      
      // Let's just use regex for the button span:
      content = content.replace(/(<span className="inline-flex[^>]*>[\s\S]*?<\/span>\s*<\/div>)/i, match => {
        return match + '\n        <div className="mt-4 pointer-events-auto">\n          <CloudImportButtons onFiles={(files) => handleFiles(files as any)} />\n        </div>';
      });
      
      fs.writeFileSync(file, content);
      console.log(`Patched ${file}`);
      patched++;
    }
  }
}

console.log(`Total patched: ${patched}`);
