import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const registryPath = path.join(__dirname, '../src/config/toolsRegistry.ts');

let content = fs.readFileSync(registryPath, 'utf8');

const regex = /id:\s*"([^"]+)",[\s\S]*?name:\s*"([^"]+)",[\s\S]*?shortDescription:\s*"([^"]+)",[\s\S]*?howToSteps:\s*\[\s*\],[\s\S]*?features:\s*\[\s*\],[\s\S]*?faqs:\s*\[\s*\]/g;

let match;
const replacements = [];

while ((match = regex.exec(content)) !== null) {
  const fullMatch = match[0];
  const toolId = match[1];
  const toolName = match[2];

  const howTo = `howToSteps: [
      { title: "1. Select or Enter Data", description: "Upload your file or paste your text/data directly into the browser." },
      { title: "2. Adjust Settings", description: "Configure the specific options for your task to get the perfect result." },
      { title: "3. Download or Copy", description: "Instantly copy the result or download the processed file securely to your device." }
    ],`;

  const features = `features: [
      { title: "100% Client-Side Processing", description: "Everything runs directly in your browser. No files or data are ever uploaded to external servers." },
      { title: "Lightning Fast", description: "Instant results without waiting for uploads, downloads, or queue times." },
      { title: "No Watermarks or Limits", description: "Completely free to use without restrictions, hidden fees, or annoying watermarks." }
    ],`;

  const faqs = `faqs: [
      { question: "Is my data secure?", answer: "Yes. ${toolName} processes everything locally in your browser. Your files and data never leave your device and are not stored on any server." },
      { question: "Do I need to install any software?", answer: "No. You can use this tool completely online from any modern web browser on your desktop or mobile device." },
      { question: "Is this tool completely free?", answer: "Yes, ${toolName} is 100% free to use with no hidden costs, no registration required, and no usage limits." }
    ]`;

  const newMatch = fullMatch
    .replace(/howToSteps:\s*\[\s*\],/, howTo)
    .replace(/features:\s*\[\s*\],/, features)
    .replace(/faqs:\s*\[\s*\]/, faqs);

  replacements.push({ old: fullMatch, new: newMatch });
}

for (const rep of replacements) {
  content = content.replace(rep.old, rep.new);
}

fs.writeFileSync(registryPath, content, 'utf8');
console.log(`Updated ${replacements.length} tools in the registry.`);
