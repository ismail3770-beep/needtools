const fs = require('fs');
let content = fs.readFileSync('src/config/toolsRegistry.ts', 'utf8');

const replacements = {
  // IMAGE TOOLS
  'image-compressor': 'OPTIMIZE IMAGE',
  'image-resizer': 'EDIT IMAGE',
  'jpg-to-png': 'CONVERT IMAGE',

  // MARKETING TOOLS
  'qr-generator': 'LINKS & SHARING',
  'url-shortener': 'LINKS & SHARING',

  // UTILITY TOOLS
  'password-generator': 'SECURITY',
  'word-counter': 'TEXT & WRITING',

  // SEO TOOLS
  'meta-tag-checker': 'META & LINKS',
  'website-seo-analyzer': 'SITE ANALYSIS',

  // AI TOOLS
  'ai-text-summarizer': 'TEXT ANALYSIS'
};

for (const [id, subCat] of Object.entries(replacements)) {
  const searchRegex = new RegExp(`(id:\\s*"${id}",[\\s\\S]*?category:\\s*"[^"]+",)`);
  // If subCategory already exists, replace it, otherwise add it.
  content = content.replace(searchRegex, `$1\n    subCategory: "${subCat}",`);
}

fs.writeFileSync('src/config/toolsRegistry.ts', content);
