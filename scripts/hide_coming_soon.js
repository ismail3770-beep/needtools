import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const registryPath = path.join(__dirname, '../src/config/toolsRegistry.ts');

let content = fs.readFileSync(registryPath, 'utf8');

// List of tools that are NOT fully implemented yet
const comingSoonTools = [
  "pdf-summary",
  "edit-pdf",
  "export-pdf",
  "pdf-to-word",
  "request-signatures",
  "website-seo-analyzer",
  "ai-text-summarizer",
  "link-shortener",
  "link-in-bio",
  "ai-copilot"
];

// Let's comment them out or just remove them from the array temporarily.
// Since removing from string is tricky with regex, we can just replace 'id: "tool-name"'
// with '// id: "tool-name", // HIDDEN' or similar, but the easiest way is to just set an isHidden flag.
// Let's add an isHidden property to them.

for (const toolId of comingSoonTools) {
  const regex = new RegExp(`id:\\s*"${toolId}",`, 'g');
  content = content.replace(regex, `id: "${toolId}",\n    isHidden: true,`);
}

fs.writeFileSync(registryPath, content, 'utf8');
console.log('Hidden coming soon tools.');