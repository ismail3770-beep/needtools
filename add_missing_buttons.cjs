const fs = require('fs');
const path = require('path');

const buttonHtml = `
          <div className="mt-6 pointer-events-none">
            <span className="inline-flex items-center gap-2 px-8 py-3.5 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl shadow-sm transition-all">
              Choose PDF File
            </span>
          </div>
        </div>`;

function injectButton(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Case 1: Has .PDF Supported badge (PdfCompressorUI, PdfToJpgUI)
  const pattern1 = /          <\/span>\n        <\/div>/g;
  if (content.match(pattern1)) {
    // Only replace the first occurrence (which is the drop zone) if it doesn't already have Choose PDF File
    if (!content.includes('Choose PDF File')) {
      content = content.replace(pattern1, `          </span>${buttonHtml}`);
    }
  } 
  // Case 2: Ends with paragraph (PdfMergeUI, PdfSplitOrganizeUI, ProtectPdfUI)
  else {
    const pattern2 = /            <\/p>\n          <\/div>/g;
    if (content.match(pattern2)) {
      if (!content.includes('Choose PDF File')) {
        content = content.replace(pattern2, `            </p>${buttonHtml}`);
      }
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath);
  }
}

const files = [
  'i:/NeedTools/src/tools-logic/pdf/PdfCompressorUI.tsx',
  'i:/NeedTools/src/tools-logic/converter/PdfToJpgUI.tsx',
  'i:/NeedTools/src/tools-logic/pdf/PdfMergeUI.tsx',
  'i:/NeedTools/src/tools-logic/pdf/PdfSplitOrganizeUI.tsx',
  'i:/NeedTools/src/tools-logic/pdf/ProtectPdfUI.tsx'
];

files.forEach(injectButton);
