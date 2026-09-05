const fs = require('fs');
let content = fs.readFileSync('src/config/toolsRegistry.ts', 'utf8');

const replacements = {
  'pdf-summary': 'AI PDF TOOLS',
  'sign-pdf': 'EDIT PDF',
  'edit-pdf': 'EDIT PDF'
};

for (const [id, subCat] of Object.entries(replacements)) {
  const searchRegex = new RegExp(`(id:\\s*"${id}",[\\s\\S]*?subCategory:\\s*)"[^"]+",`);
  content = content.replace(searchRegex, `$1"${subCat}",`);
}

fs.writeFileSync('src/config/toolsRegistry.ts', content);
