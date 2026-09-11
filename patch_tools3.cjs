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
  if (content.includes('onDrop')) {
    let handlerCode = '';
    if (content.includes('handleFiles(')) {
      handlerCode = '<CloudImportButtons onFiles={(files) => handleFiles(files as any)} />';
    } else if (content.includes('handleFileSelection(')) {
      handlerCode = '<CloudImportButtons multiple={false} onFiles={(files) => files[0] && handleFileSelection(files[0])} />';
    } else if (content.includes('handleFileChange(')) {
      // Some might only have handleFileChange
      // Actually let's assume we can inject handleFileSelection if we see handleFileSelection.
      // Wait, PdfToJpgUI? ImageToPdfUI? Let's check them.
      // We will just skip if we don't know the handler.
    }

    if (handlerCode && !content.includes('CloudImportButtons')) {
      const importLine = 'import { CloudImportButtons } from "@/components/ui/CloudImportButtons";\n';
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const nextLine = content.indexOf('\n', lastImportIndex) + 1;
        content = content.slice(0, nextLine) + importLine + content.slice(nextLine);
      } else {
        content = importLine + content;
      }

      // Add component before the closing div of the dropzone
      content = content.replace(/(<span className="inline-flex[^>]*>[\s\S]*?<\/span>\s*<\/div>)/i, match => {
        return match + '\n        <div className="mt-4 pointer-events-auto">\n          ' + handlerCode + '\n        </div>';
      });
      
      fs.writeFileSync(file, content);
      console.log(`Patched ${file}`);
      patched++;
    }
  }
}

console.log(`Total patched: ${patched}`);
