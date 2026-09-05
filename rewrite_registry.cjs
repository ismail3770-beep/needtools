const fs = require('fs');
let content = fs.readFileSync('src/config/toolsRegistry.ts', 'utf8');

const replacements = {
  'pdf-merge': 'ORGANIZE PDF',
  'pdf-split': 'ORGANIZE PDF',
  'pdf-compressor': 'OPTIMIZE PDF',
  'image-to-pdf': 'CONVERT TO PDF',
  'pdf-to-jpg': 'CONVERT FROM PDF',
  'pdf-to-word': 'CONVERT FROM PDF',
  'export-pdf': 'CONVERT FROM PDF',
  'protect-pdf': 'PDF SECURITY',
  'sign-pdf': 'PDF SECURITY',
  'pdf-summary': 'PDF SECURITY',
  'edit-pdf': 'PDF SECURITY',
  'request-signatures': 'PDF SECURITY'
};

for (const [id, subCat] of Object.entries(replacements)) {
  const searchRegex = new RegExp(`(id:\\s*"${id}",[\\s\\S]*?category:\\s*"pdf",)`);
  content = content.replace(searchRegex, `$1\n    subCategory: "${subCat}",`);
}

fs.writeFileSync('src/config/toolsRegistry.ts', content);
