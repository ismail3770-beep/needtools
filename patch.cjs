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
  content = content.replace("const handleDownload = () => {", "const handleDownload = () => {\n    window.dispatchEvent(new CustomEvent('tool_processed', { detail: { fileName: 'processed_file' } }));");
  // Some files might have `const handleDownload = async () => {`
  content = content.replace("const handleDownload = async () => {", "const handleDownload = async () => {\n    window.dispatchEvent(new CustomEvent('tool_processed', { detail: { fileName: 'processed_file' } }));");
  fs.writeFileSync(file, content);
}
console.log('Patched cleanly');
