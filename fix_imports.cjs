const fs = require('fs');

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
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('import { CloudImportButtons } from "@/components/ui/CloudImportButtons";')) {
    content = content.replace(/import \{ CloudImportButtons \} from "@\/components\/ui\/CloudImportButtons";\n/g, '');
    content = content.replace(/"use client";\r?\n/, '"use client";\n\nimport { CloudImportButtons } from "@/components/ui/CloudImportButtons";\n');
    fs.writeFileSync(file, content);
    console.log(`Fixed imports in ${file}`);
  }
}
