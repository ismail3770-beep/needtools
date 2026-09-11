const fs = require('fs');
const path = require('path');

const tools = [
  { id: 'remove-pages', slug: 'remove-pages', name: 'Remove Pages', shortDescription: 'Remove pages from a PDF file.', fullDescription: 'Easily remove specific pages from your PDF document online.', category: 'pdf', subCategory: 'ORGANIZE PDF', iconName: 'FileMinus', component: 'RemovePagesUI', dir: 'pdf' },
  { id: 'organize-pdf', slug: 'organize-pdf', name: 'Organize PDF', shortDescription: 'Sort, add, and delete PDF pages.', fullDescription: 'Reorder pages, add new ones, or remove pages to organize your PDF document.', category: 'pdf', subCategory: 'ORGANIZE PDF', iconName: 'Layers', component: 'OrganizePdfUI', dir: 'pdf' },
  { id: 'grayscale-pdf', slug: 'grayscale-pdf', name: 'Grayscale PDF', shortDescription: 'Convert PDF text and images to grayscale.', fullDescription: 'Convert your PDF to black and white or grayscale for printing or reducing size.', category: 'pdf', subCategory: 'OPTIMIZE PDF', iconName: 'Contrast', component: 'GrayscalePdfUI', dir: 'pdf' },
  { id: 'extract-pdf-pages', slug: 'extract-pdf-pages', name: 'Extract PDF Pages', shortDescription: 'Extract pages from your PDF.', fullDescription: 'Get a new PDF by extracting specific pages from your document.', category: 'pdf', subCategory: 'ORGANIZE PDF', iconName: 'FileSymlink', component: 'ExtractPdfPagesUI', dir: 'pdf' },
  { id: 'repair-pdf', slug: 'repair-pdf', name: 'Repair PDF', shortDescription: 'Repair a corrupted or damaged PDF file.', fullDescription: 'Attempt to fix and recover data from a corrupted PDF document.', category: 'pdf', subCategory: 'OPTIMIZE PDF', iconName: 'Wrench', component: 'RepairPdfUI', dir: 'pdf' },
  { id: 'png-to-pdf', slug: 'png-to-pdf', name: 'PNG to PDF', shortDescription: 'Convert PNG images to PDF.', fullDescription: 'Easily convert your PNG images to a single PDF document.', category: 'converter', subCategory: 'CONVERT TO PDF', iconName: 'Image', component: 'PngToPdfUI', dir: 'converter' },
  { id: 'bmp-to-pdf', slug: 'bmp-to-pdf', name: 'BMP to PDF', shortDescription: 'Convert BMP images to PDF.', fullDescription: 'Easily convert your BMP images to a single PDF document.', category: 'converter', subCategory: 'CONVERT TO PDF', iconName: 'Image', component: 'BmpToPdfUI', dir: 'converter' },
  { id: 'tiff-to-pdf', slug: 'tiff-to-pdf', name: 'TIFF to PDF', shortDescription: 'Convert TIFF images to PDF.', fullDescription: 'Easily convert your TIFF images to a single PDF document.', category: 'converter', subCategory: 'CONVERT TO PDF', iconName: 'Image', component: 'TiffToPdfUI', dir: 'converter' },
  { id: 'ppt-to-pdf', slug: 'ppt-to-pdf', name: 'PPT to PDF', shortDescription: 'Convert PowerPoint to PDF.', fullDescription: 'Turn your PPT or PPTX presentations into PDF documents.', category: 'converter', subCategory: 'CONVERT TO PDF', iconName: 'Presentation', component: 'PptToPdfUI', dir: 'converter' },
  { id: 'txt-to-pdf', slug: 'txt-to-pdf', name: 'TXT to PDF', shortDescription: 'Convert TXT to PDF.', fullDescription: 'Convert your plain text files into PDF documents.', category: 'converter', subCategory: 'CONVERT TO PDF', iconName: 'FileText', component: 'TxtToPdfUI', dir: 'converter' },
  { id: 'excel-to-pdf', slug: 'excel-to-pdf', name: 'Excel to PDF', shortDescription: 'Convert Excel to PDF.', fullDescription: 'Turn your XLSX or XLS spreadsheets into PDF documents.', category: 'converter', subCategory: 'CONVERT TO PDF', iconName: 'Table', component: 'ExcelToPdfUI', dir: 'converter' },
  { id: 'pdf-to-png', slug: 'pdf-to-png', name: 'PDF to PNG', shortDescription: 'Convert PDF to PNG images.', fullDescription: 'Extract pages from your PDF as high-quality PNG images.', category: 'pdf', subCategory: 'CONVERT FROM PDF', iconName: 'Image', component: 'PdfToPngUI', dir: 'pdf' },
  { id: 'pdf-to-bmp', slug: 'pdf-to-bmp', name: 'PDF to BMP', shortDescription: 'Convert PDF to BMP images.', fullDescription: 'Extract pages from your PDF as high-quality BMP images.', category: 'pdf', subCategory: 'CONVERT FROM PDF', iconName: 'Image', component: 'PdfToBmpUI', dir: 'pdf' },
  { id: 'pdf-to-tiff', slug: 'pdf-to-tiff', name: 'PDF to TIFF', shortDescription: 'Convert PDF to TIFF images.', fullDescription: 'Extract pages from your PDF as high-quality TIFF images.', category: 'pdf', subCategory: 'CONVERT FROM PDF', iconName: 'Image', component: 'PdfToTiffUI', dir: 'pdf' },
  { id: 'pdf-to-ppt', slug: 'pdf-to-ppt', name: 'PDF to PPT', shortDescription: 'Convert PDF to PowerPoint.', fullDescription: 'Turn your PDF into an editable PPTX presentation.', category: 'pdf', subCategory: 'CONVERT FROM PDF', iconName: 'Presentation', component: 'PdfToPptUI', dir: 'pdf' },
  { id: 'pdf-to-txt', slug: 'pdf-to-txt', name: 'PDF to TXT', shortDescription: 'Convert PDF to TXT.', fullDescription: 'Extract text from your PDF into a plain TXT file.', category: 'pdf', subCategory: 'CONVERT FROM PDF', iconName: 'FileText', component: 'PdfToTxtUI', dir: 'pdf' },
  { id: 'pdf-to-zip', slug: 'pdf-to-zip', name: 'PDF to ZIP', shortDescription: 'Compress PDF into ZIP.', fullDescription: 'Compress your PDF files into a ZIP archive.', category: 'pdf', subCategory: 'CONVERT FROM PDF', iconName: 'Archive', component: 'PdfToZipUI', dir: 'pdf' }
];

const template = `// Generated UI Component
"use client";
import React, { useState } from "react";
import { UploadCloud, FileType, CheckCircle2 } from "lucide-react";
import { CloudImportButtons } from "@/components/ui/CloudImportButtons";

export default function __COMPONENT__() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelection = (f: File) => {
    setFile(f);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm w-full max-w-3xl mx-auto">
      <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center mb-4">
        <FileType className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Upload your file</h2>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-center max-w-md">
        Select a file from your device or import from cloud storage to begin.
      </p>
      
      {!file ? (
        <div className="w-full max-w-md relative">
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-10 h-10 text-zinc-400 mb-3" />
              <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
            </div>
            <input type="file" className="hidden" onChange={(e) => e.target.files && handleFileSelection(e.target.files[0])} />
          </label>
          <div className="mt-4 pointer-events-auto">
            <CloudImportButtons multiple={false} onFiles={(files) => files[0] && handleFileSelection(files[0] as any)} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center p-6 bg-zinc-50 dark:bg-zinc-800 rounded-2xl w-full max-w-md text-center border border-zinc-200 dark:border-zinc-700">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
          <p className="text-sm font-medium text-zinc-900 dark:text-white w-full mb-6 whitespace-nowrap overflow-hidden text-ellipsis px-4">
            {file.name}
          </p>
          <button className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors w-full">
            Process File
          </button>
        </div>
      )}
    </div>
  );
}
`;

tools.forEach(tool => {
  const dirPath = path.join(__dirname, 'src', 'tools-logic', tool.dir);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
  const filePath = path.join(dirPath, tool.component + '.tsx');
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, template.replace(/__COMPONENT__/g, tool.component));
    console.log("Created", filePath);
  }
});

const registryPath = path.join(__dirname, 'src', 'config', 'toolsRegistry.ts');
let registryContent = fs.readFileSync(registryPath, 'utf8');

const newEntries = tools.map(t => {
  return `  {
    id: "${t.id}",
    slug: "${t.slug}",
    name: "${t.name}",
    shortDescription: "${t.shortDescription}",
    fullDescription: "${t.fullDescription}",
    category: "${t.category}",
    subCategory: "${t.subCategory}",
    iconName: "${t.iconName}",
    tags: ["pdf", "tool"],
    intentKeywords: ["${t.name.toLowerCase()}"],
    isClientSide: true,
    isNew: true,
    howToSteps: [
      { title: "1. Upload File", description: "Select your file to begin." },
      { title: "2. Process", description: "Click process to run the tool." },
      { title: "3. Download", description: "Save the processed file." }
    ],
    features: [
      { title: "Fast & Secure", description: "Processed directly in your browser." }
    ],
    faqs: []
  }`;
});

const endOfArray = registryContent.lastIndexOf('];');
if (endOfArray !== -1) {
  const existingToolsContent = registryContent.substring(0, endOfArray);
  
  let toolsToAdd = [];
  for (let i = 0; i < tools.length; i++) {
    if (!registryContent.includes(`id: "${tools[i].id}"`)) {
      toolsToAdd.push(newEntries[i]);
    }
  }
  
  if (toolsToAdd.length > 0) {
    registryContent = existingToolsContent + (existingToolsContent.endsWith(',') ? '' : ',\n') + toolsToAdd.join(',\n') + '\n];\n' + registryContent.substring(endOfArray + 2);
    fs.writeFileSync(registryPath, registryContent);
    console.log("Updated toolsRegistry.ts");
  }
}

const dispatcherPath = path.join(__dirname, 'src', 'components', 'tools', 'ToolDispatcher.tsx');
let dispatcherContent = fs.readFileSync(dispatcherPath, 'utf8');

let importsToAdd = [];
let switchCasesToAdd = [];

tools.forEach(t => {
  if (!dispatcherContent.includes(t.component)) {
    importsToAdd.push(`const ${t.component} = dynamic(() => import("@/tools-logic/${t.dir}/${t.component}"), { loading: () => <ToolLoader />, ssr: false });`);
    switchCasesToAdd.push(`      case "${t.id}": return <${t.component} />;`);
  }
});

if (importsToAdd.length > 0) {
  const lastDynamicImport = dispatcherContent.lastIndexOf('dynamic(() => import');
  if (lastDynamicImport !== -1) {
    const endOfLastImport = dispatcherContent.indexOf(';', lastDynamicImport) + 1;
    dispatcherContent = dispatcherContent.substring(0, endOfLastImport) + '\n' + importsToAdd.join('\n') + dispatcherContent.substring(endOfLastImport);
  }
}

if (switchCasesToAdd.length > 0) {
  const defaultCase = dispatcherContent.lastIndexOf('default:');
  if (defaultCase !== -1) {
    dispatcherContent = dispatcherContent.substring(0, defaultCase) + switchCasesToAdd.join('\n') + '\n      ' + dispatcherContent.substring(defaultCase);
  }
}

if (importsToAdd.length > 0 || switchCasesToAdd.length > 0) {
  fs.writeFileSync(dispatcherPath, dispatcherContent);
  const log = "Updated ToolDispatcher.tsx";
  console.log(log);
}

console.log("Done!");
