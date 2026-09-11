const fs = require('fs');
const files = [
  'src/tools-logic/developer/MarkdownPreviewerUI.tsx',
  'src/tools-logic/image/ImageCompressorUI.tsx',
  'src/tools-logic/image/ImageResizerUI.tsx',
  'src/tools-logic/image/JpgToPngUI.tsx',
  'src/tools-logic/pdf-text-edit/PdfTextEditUI.tsx',
  'src/tools-logic/security/QrCodeGeneratorUI.tsx'
];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/(const handleDownload = .*?\{)/, "$1\n    window.dispatchEvent(new CustomEvent('tool_processed', { detail: { fileName: 'processed_file' } }));\n");
  fs.writeFileSync(file, content);
}
console.log('Patched handleDownload');
