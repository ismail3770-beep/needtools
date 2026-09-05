const fs = require('fs');

const standardClass = 'px-4 py-3 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 text-black/70 dark:text-white/70 font-semibold rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors';

function updateResetButtonStyle(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // We look for button with onClick={resetTool} or similar, and replace its className with the standard one.
  // Because some have flex-1 sm:flex-none, we should preserve that.
  content = content.replace(
    /className="(flex-1[^"]*|w-full[^"]*|px-4[^"]*)bg-white[^"]*transition-colors"/g,
    (match, p1) => {
      // If it already has flex-1 sm:flex-none, keep it
      if (p1.includes('flex-1 sm:flex-none') || p1.includes('w-full flex items-center justify-center')) {
        let prefix = p1.includes('flex-1 sm:flex-none') ? 'flex-1 sm:flex-none ' : 'w-full flex items-center justify-center gap-2 ';
        return `className="${prefix}${standardClass}"`;
      }
      return `className="${standardClass}"`;
    }
  );

  // For PdfSplitOrganizeUI, the button is "flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-black/60 dark:text-whi"
  content = content.replace(
    /className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium[^"]*transition-colors"/g,
    `className="flex-1 sm:flex-none ${standardClass}"`
  );

  // For ImageToPdfUI (Clear All Photos)
  content = content.replace(
    /className="py-2.5 px-4 rounded-xl border border-black\/10[^"]*text-center"/g,
    `className="flex-1 sm:flex-none ${standardClass}"`
  );

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated style in ' + filePath);
  }
}

const files = [
  'i:/NeedTools/src/tools-logic/pdf/PdfCompressorUI.tsx',
  'i:/NeedTools/src/tools-logic/pdf/PdfMergeUI.tsx',
  'i:/NeedTools/src/tools-logic/pdf/ProtectPdfUI.tsx',
  'i:/NeedTools/src/tools-logic/pdf/PdfSplitOrganizeUI.tsx',
  'i:/NeedTools/src/tools-logic/converter/PdfToJpgUI.tsx',
  'i:/NeedTools/src/tools-logic/converter/ImageToPdfUI.tsx'
];

files.forEach(updateResetButtonStyle);
