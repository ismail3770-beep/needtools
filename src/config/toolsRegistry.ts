import { ToolItem } from "@/types/tool";



export const TOOLS_REGISTRY: ToolItem[] = [

  // -----------------------------------------------------

  // 1. PDF Tools

  // -----------------------------------------------------

  {
    id: "pdf-editor",
    slug: "edit-pdf",
    name: "PDF Editor",
    shortDescription: "Edit text, add images, replace content, and modify PDFs online instantly.",
    fullDescription: "The ultimate Free PDF Editor. Edit your PDF files directly in your browser with zero lag. Replace existing text, add new paragraphs, insert images, and mask confidential information without uploading your files to random servers. Perfect for fast, seamless, and secure PDF modifications.",
    category: "pdf",
    subCategory: "EDIT PDF",
    iconName: "Edit3",
    tags: ["pdf", "edit", "text", "image", "pdf editor", "modify pdf", "add text to pdf", "change pdf text", "online pdf editor", "free pdf editor"],
    intentKeywords: ["edit pdf online free", "how to edit pdf text", "change text in pdf", "add image to pdf", "pdf editor without watermark", "type on pdf", "best pdf editor online"],
    isClientSide: false, // Hybrid actually, but UI is client-side
    isPopular: true,
    isNew: true,
    howToSteps: [
      { title: "1. Upload Your PDF", description: "Select the PDF file you want to edit. It loads instantly in your browser." },
      { title: "2. Mask & Replace Text", description: "Use the 'Erase' tool to white-out existing text, then use the 'Add Text' tool to type new content in its place." },
      { title: "3. Save & Download", description: "Click 'Save PDF'. Our high-speed backend will process your edits perfectly and return the updated file in seconds." }
    ],
    features: [
      { title: "Zero Lag Editing Experience", description: "Our hybrid architecture means you edit directly in your browser with no frustrating lag or delays." },
      { title: "True Text Modification", description: "Easily cover up old names, dates, or prices, and type new ones perfectly." },
      { title: "100% Free & No Watermarks", description: "Edit as many PDFs as you want without any hidden fees, subscriptions, or watermarks ruining your document." }
    ],
    faqs: [
      { question: "Can I change existing text in my PDF?", answer: "Yes! Use the Erase (Mask) tool to cover the old text, then use the Add Text tool to write the new text exactly where you want it." },
      { question: "Is my document secure?", answer: "Absolutely. We use a highly secure, automated processing system. Your file is processed and immediately discarded. No one looks at your documents." },
      { question: "Will this add a watermark to my PDF?", answer: "No. NeedTools provides premium PDF editing features completely free and without any watermarks." }
    ],
  },
  {
    id: "pdf-text-edit",
    slug: "pdf-text-edit",
    name: "PDF Text Editor",
    shortDescription: "Edit existing text directly inside any PDF — click, change, and download. No backend needed.",
    fullDescription: "A true WYSIWYG PDF text editor that lets you click on any text in your PDF and edit it directly in your browser. Uses smart text detection to find every text block, then lets you modify the content while preserving the original layout, fonts, and formatting. Everything runs 100% client-side — your files never leave your device.",
    category: "pdf",
    subCategory: "EDIT PDF",
    iconName: "TextCursorInput",
    tags: ["pdf", "text edit", "edit pdf text", "change pdf text", "modify pdf", "pdf editor", "inline edit"],
    intentKeywords: [
      "edit text in pdf",
      "change text in pdf online",
      "modify pdf text free",
      "pdf text editor no upload",
      "edit existing pdf text",
      "replace text in pdf",
      "inline pdf text editing",
    ],
    isClientSide: true,
    isPopular: true,
    isNew: true,
    maxFileSizeMB: 10,
    howToSteps: [
      { title: "1. Upload Your PDF", description: "Select a text-based PDF file (up to 10MB, 20 pages). Scanned documents are not supported." },
      { title: "2. Click & Edit Text", description: "Click on any text in the PDF to select it. Type your changes directly — the editor preserves original font size and positioning." },
      { title: "3. Preview & Download", description: "Preview your edited PDF to verify changes, then download the final result. Original layout and images are fully preserved." },
    ],
    features: [
      { title: "True Inline Text Editing", description: "Click directly on any text block in the PDF to edit it in place — no separate text boxes or overlays needed." },
      { title: "100% Client-Side Processing", description: "Everything runs in your browser using pdf.js and pdf-lib. Your files are never uploaded to any server." },
      { title: "Smart Font Matching", description: "Automatically detects font families (serif, sans-serif, mono) and maps to the closest standard PDF font with bold/italic support." },
    ],
    faqs: [
      { question: "Can I edit any PDF?", answer: "This tool works on text-based PDFs. Scanned documents (image-only PDFs) are not supported as they don't contain editable text layers." },
      { question: "Will the fonts match perfectly?", answer: "We map detected fonts to the closest standard PDF fonts (Helvetica, Times, Courier). For most documents this produces great results, but custom or decorative fonts may look slightly different." },
      { question: "Is there a file size limit?", answer: "Yes, currently limited to 10MB and 20 pages to ensure smooth performance. These limits may increase in future updates." },
      { question: "Are my files uploaded anywhere?", answer: "No! Everything runs 100% in your browser. Your PDF never leaves your device — we use pdf.js for reading and pdf-lib for writing, both running locally." },
    ],
  },
  {

    id: "pdf-compressor",

    slug: "pdf-compressor",

    name: "PDF Compressor",

    shortDescription: "Reduce the file size of your PDF documents instantly.",

    fullDescription: "Our PDF Compressor allows you to reduce the file size of your PDF documents without losing quality, directly in your browser.",

    category: "pdf",

    subCategory: "OPTIMIZE PDF",

    iconName: "FileArchive",

    tags: ["pdf", "compress", "shrink", "optimize"],

    intentKeywords: ["compress pdf", "reduce pdf size"],

    isClientSide: true,

    isNew: false,

    howToSteps: [
      { title: "1. Select or Enter Data", description: "Upload your file or paste your text/data directly into the browser." },
      { title: "2. Adjust Settings", description: "Configure the specific options for your task to get the perfect result." },
      { title: "3. Download or Copy", description: "Instantly copy the result or download the processed file securely to your device." }
    ],

    features: [
      { title: "100% Client-Side Processing", description: "Everything runs directly in your browser. No files or data are ever uploaded to external servers." },
      { title: "Lightning Fast", description: "Instant results without waiting for uploads, downloads, or queue times." },
      { title: "No Watermarks or Limits", description: "Completely free to use without restrictions, hidden fees, or annoying watermarks." }
    ],

    faqs: [
      { question: "Is my data secure?", answer: "Yes. PDF Compressor processes everything locally in your browser. Your files and data never leave your device and are not stored on any server." },
      { question: "Do I need to install any software?", answer: "No. You can use this tool completely online from any modern web browser on your desktop or mobile device." },
      { question: "Is this tool completely free?", answer: "Yes, PDF Compressor is 100% free to use with no hidden costs, no registration required, and no usage limits." }
    ],

  },

  {

    id: "pdf-to-jpg",

    slug: "pdf-to-jpg",

    name: "PDF to JPG Converter",

    shortDescription: "Convert PDF pages into high-quality JPG images.",

    fullDescription: "Convert your PDF pages into individual JPG images directly in your browser. Complete privacy with zero server uploads.",

    category: "pdf",

    subCategory: "CONVERT FROM PDF",

    iconName: "FileImage",

    tags: ["pdf", "jpg", "converter"],

    intentKeywords: ["pdf to jpg", "convert pdf to image"],

    isClientSide: true,

    isNew: false,

    howToSteps: [
      { title: "1. Select or Enter Data", description: "Upload your file or paste your text/data directly into the browser." },
      { title: "2. Adjust Settings", description: "Configure the specific options for your task to get the perfect result." },
      { title: "3. Download or Copy", description: "Instantly copy the result or download the processed file securely to your device." }
    ],

    features: [
      { title: "100% Client-Side Processing", description: "Everything runs directly in your browser. No files or data are ever uploaded to external servers." },
      { title: "Lightning Fast", description: "Instant results without waiting for uploads, downloads, or queue times." },
      { title: "No Watermarks or Limits", description: "Completely free to use without restrictions, hidden fees, or annoying watermarks." }
    ],

    faqs: [
      { question: "Is my data secure?", answer: "Yes. PDF to JPG Converter processes everything locally in your browser. Your files and data never leave your device and are not stored on any server." },
      { question: "Do I need to install any software?", answer: "No. You can use this tool completely online from any modern web browser on your desktop or mobile device." },
      { question: "Is this tool completely free?", answer: "Yes, PDF to JPG Converter is 100% free to use with no hidden costs, no registration required, and no usage limits." }
    ],

  },

  {

    id: "image-to-pdf",

    slug: "image-to-pdf",

    name: "JPG to PDF Converter",

    shortDescription: "Convert multiple JPG, PNG, and WebP images into a single PDF document in seconds.",

    fullDescription: "Combine and convert your photos into a clean, multi-page PDF document completely in your browser. Choose page orientation, margins, and paper sizes without uploading files to any server.",

    category: "pdf",

    subCategory: "CONVERT TO PDF",

    iconName: "FileCheck2",

    tags: ["pdf", "image to pdf", "jpg to pdf", "png to pdf", "convert", "document"],

    intentKeywords: [

      "convert jpg to pdf free",

      "combine images into one pdf",

      "photo to pdf converter without watermark",

      "multiple png to pdf online",

    ],

    isPopular: true,

    isClientSide: true,

    howToSteps: [

      {

        title: "1. Select Images",

        description: "Upload one or multiple JPG, PNG, or WebP images.",

      },

      {

        title: "2. Configure PDF Settings",

        description: "Select page size (A4 / Letter), orientation (Portrait / Landscape), and margins.",

      },

      {

        title: "3. Download PDF",

        description: "Click Download to compile and save your clean PDF document.",

      },

    ],

    features: [

      {

        title: "100% Zero-Upload Privacy",

        description: "Your confidential documents and images never touch a remote server.",

      },

      {

        title: "Multi-Image Merging",

        description: "Combine unlimited images into a single unified multi-page PDF.",

      },

    ],

    faqs: [

      {

        question: "Is there any watermark on the PDF?",

        answer: "No! needtools produces clean, watermark-free PDF files for personal and professional use.",

      },

      {

        question: "How many images can I convert at once?",

        answer: "You can convert dozens of images simultaneously directly in your device RAM.",

      },

    ],

  },

  {

    id: "pdf-merge",

    slug: "pdf-merge",

    name: "PDF Merge",

    shortDescription: "Combine multiple PDF files into a single document.",

    fullDescription: "Easily merge multiple PDF files into one directly in your browser. Complete privacy with no file uploads.",

    category: "pdf",

    subCategory: "ORGANIZE PDF",

    iconName: "Merge",

    tags: ["pdf", "merge", "combine"],

    intentKeywords: ["merge pdfs", "combine pdf files"],

    isClientSide: true,

    isNew: false,

    howToSteps: [
      { title: "1. Select or Enter Data", description: "Upload your file or paste your text/data directly into the browser." },
      { title: "2. Adjust Settings", description: "Configure the specific options for your task to get the perfect result." },
      { title: "3. Download or Copy", description: "Instantly copy the result or download the processed file securely to your device." }
    ],

    features: [
      { title: "100% Client-Side Processing", description: "Everything runs directly in your browser. No files or data are ever uploaded to external servers." },
      { title: "Lightning Fast", description: "Instant results without waiting for uploads, downloads, or queue times." },
      { title: "No Watermarks or Limits", description: "Completely free to use without restrictions, hidden fees, or annoying watermarks." }
    ],

    faqs: [
      { question: "Is my data secure?", answer: "Yes. PDF Merge processes everything locally in your browser. Your files and data never leave your device and are not stored on any server." },
      { question: "Do I need to install any software?", answer: "No. You can use this tool completely online from any modern web browser on your desktop or mobile device." },
      { question: "Is this tool completely free?", answer: "Yes, PDF Merge is 100% free to use with no hidden costs, no registration required, and no usage limits." }
    ],

  },

  {

    id: "pdf-split",

    slug: "pdf-split",

    name: "PDF Split & Organize",

    shortDescription: "Split, extract, and reorder pages in a PDF document.",

    fullDescription: "Split your PDF file into individual pages or specific ranges, and reorganize them easily.",

    category: "pdf",

    subCategory: "ORGANIZE PDF",

    iconName: "Scissors",

    tags: ["pdf", "split", "extract", "organize"],

    intentKeywords: ["split pdf", "extract pdf pages", "organize pdf pages"],

    isClientSide: true,

    isNew: false,

    howToSteps: [
      { title: "1. Select or Enter Data", description: "Upload your file or paste your text/data directly into the browser." },
      { title: "2. Adjust Settings", description: "Configure the specific options for your task to get the perfect result." },
      { title: "3. Download or Copy", description: "Instantly copy the result or download the processed file securely to your device." }
    ],

    features: [
      { title: "100% Client-Side Processing", description: "Everything runs directly in your browser. No files or data are ever uploaded to external servers." },
      { title: "Lightning Fast", description: "Instant results without waiting for uploads, downloads, or queue times." },
      { title: "No Watermarks or Limits", description: "Completely free to use without restrictions, hidden fees, or annoying watermarks." }
    ],

    faqs: [
      { question: "Is my data secure?", answer: "Yes. PDF Split & Organize processes everything locally in your browser. Your files and data never leave your device and are not stored on any server." },
      { question: "Do I need to install any software?", answer: "No. You can use this tool completely online from any modern web browser on your desktop or mobile device." },
      { question: "Is this tool completely free?", answer: "Yes, PDF Split & Organize is 100% free to use with no hidden costs, no registration required, and no usage limits." }
    ],

  },

  {

    id: "protect-pdf",

    slug: "protect-pdf",

    name: "Protect PDF",

    shortDescription: "Add a secure password to encrypt your PDF files.",

    fullDescription: "Secure your confidential PDF files with a strong password. Processing happens locally so your files are never uploaded.",

    category: "pdf",

    subCategory: "PDF SECURITY",

    iconName: "Lock",

    tags: ["pdf", "protect", "password", "encrypt", "secure"],

    intentKeywords: ["protect pdf", "add password to pdf", "encrypt pdf"],

    isClientSide: true,

    isNew: false,

    howToSteps: [
      { title: "1. Select or Enter Data", description: "Upload your file or paste your text/data directly into the browser." },
      { title: "2. Adjust Settings", description: "Configure the specific options for your task to get the perfect result." },
      { title: "3. Download or Copy", description: "Instantly copy the result or download the processed file securely to your device." }
    ],

    features: [
      { title: "100% Client-Side Processing", description: "Everything runs directly in your browser. No files or data are ever uploaded to external servers." },
      { title: "Lightning Fast", description: "Instant results without waiting for uploads, downloads, or queue times." },
      { title: "No Watermarks or Limits", description: "Completely free to use without restrictions, hidden fees, or annoying watermarks." }
    ],

    faqs: [
      { question: "Is my data secure?", answer: "Yes. Protect PDF processes everything locally in your browser. Your files and data never leave your device and are not stored on any server." },
      { question: "Do I need to install any software?", answer: "No. You can use this tool completely online from any modern web browser on your desktop or mobile device." },
      { question: "Is this tool completely free?", answer: "Yes, Protect PDF is 100% free to use with no hidden costs, no registration required, and no usage limits." }
    ],

  },

  {

    id: "sign-pdf",

    slug: "sign-pdf",

    name: "Fill & Sign PDF",

    shortDescription: "Draw your signature and fill out PDF forms directly in your browser.",

    fullDescription: "Sign documents quickly without printing. Draw or type your signature entirely securely in your browser.",

    category: "pdf",

    subCategory: "EDIT PDF",

    iconName: "PenTool",

    tags: ["pdf", "sign", "fill", "signature", "draw"],

    intentKeywords: ["sign pdf", "fill pdf", "draw signature on pdf"],

    isClientSide: true,

    isNew: false,

    howToSteps: [
      { title: "1. Select or Enter Data", description: "Upload your file or paste your text/data directly into the browser." },
      { title: "2. Adjust Settings", description: "Configure the specific options for your task to get the perfect result." },
      { title: "3. Download or Copy", description: "Instantly copy the result or download the processed file securely to your device." }
    ],

    features: [
      { title: "100% Client-Side Processing", description: "Everything runs directly in your browser. No files or data are ever uploaded to external servers." },
      { title: "Lightning Fast", description: "Instant results without waiting for uploads, downloads, or queue times." },
      { title: "No Watermarks or Limits", description: "Completely free to use without restrictions, hidden fees, or annoying watermarks." }
    ],

    faqs: [
      { question: "Is my data secure?", answer: "Yes. Fill & Sign PDF processes everything locally in your browser. Your files and data never leave your device and are not stored on any server." },
      { question: "Do I need to install any software?", answer: "No. You can use this tool completely online from any modern web browser on your desktop or mobile device." },
      { question: "Is this tool completely free?", answer: "Yes, Fill & Sign PDF is 100% free to use with no hidden costs, no registration required, and no usage limits." }
    ],

  },


  // -----------------------------------------------------

  // 2. Image Tools

  // -----------------------------------------------------

  {

    id: "image-compressor",

    slug: "image-compressor",

    name: "Image Compressor",

    shortDescription: "Compress JPG, PNG, and WebP images up to 80% without losing visual quality.",

    fullDescription: "Optimize and reduce the file size of your photos directly inside your browser. With our zero-upload policy, your images never leave your device, ensuring total privacy and instantaneous processing.",

    category: "image",
    subCategory: "OPTIMIZE IMAGE",

    iconName: "Minimize",

    tags: ["compress", "image", "jpg", "png", "webp", "optimize", "photo size"],

    intentKeywords: [

      "compress photo to 50kb",

      "reduce photo size",

      "compress image for job application",

      "reduce image mb to kb",

      "online image compressor without upload",

      "photo size reducer",

    ],

    isPopular: true,

    isClientSide: true,

    maxFileSizeMB: 15,

    howToSteps: [

      {

        title: "1. Upload Your Image",

        description: "Drag and drop your JPG, PNG, or WebP file into the upload zone or click to select from your device.",

      },

      {

        title: "2. Adjust Compression Level",

        description: "Use the interactive slider to choose your desired balance between file size reduction and image clarity.",

      },

      {

        title: "3. Instant Download",

        description: "Preview the compressed result with real-time size savings comparison and download your optimized image with one click.",

      },

    ],

    features: [

      {

        title: "100% Client-Side Privacy",

        description: "All compression happens in your browser RAM. Your photos are never sent over the internet or stored on external servers.",

      },

      {

        title: "Smart Adaptive Compression",

        description: "Uses native Canvas rendering and quantization algorithms to retain sharp details while slashing file sizes by up to 80%.",

      },

      {

        title: "Batch & Large File Support",

        description: "Handles high-resolution images up to 15MB smoothly without freezing your device.",

      },

    ],

    faqs: [

      {

        question: "Are my photos uploaded to any server?",

        answer: "No! needtools operates under a strict Zero-Upload policy. All compression calculations are performed purely using your computer or phone's browser memory.",

      },

      {

        question: "Will image quality degrade after compression?",

        answer: "Our smart algorithm targets imperceptible redundant color data. At 70-80% quality settings, the human eye cannot distinguish the difference, yet the file size drops dramatically.",

      },

      {
        question: "What image formats are supported?",
        answer: "You can compress JPG, JPEG, PNG, and modern WebP formats seamlessly.",
      },
    ],
  },
  {
    id: "image-resizer",
    slug: "image-resizer",
    name: "Image Resizer",
    shortDescription: "Resize images to specific dimensions instantly.",
    fullDescription: "Resize your photos and images to exact pixel dimensions securely in your browser.",
    category: "image",
    subCategory: "EDIT IMAGE",
    iconName: "Maximize",
    tags: ["image", "resize", "scale"],
    intentKeywords: ["resize image", "change image dimensions"],
    isClientSide: true,
    isNew: false,
    howToSteps: [
      { title: "1. Select or Enter Data", description: "Upload your file or paste your text/data directly into the browser." },
      { title: "2. Adjust Settings", description: "Configure the specific options for your task to get the perfect result." },
      { title: "3. Download or Copy", description: "Instantly copy the result or download the processed file securely to your device." }
    ],
    features: [
      { title: "100% Client-Side Processing", description: "Everything runs directly in your browser. No files or data are ever uploaded to external servers." },
      { title: "Lightning Fast", description: "Instant results without waiting for uploads, downloads, or queue times." },
      { title: "No Watermarks or Limits", description: "Completely free to use without restrictions, hidden fees, or annoying watermarks." }
    ],
    faqs: [
      { question: "Is my data secure?", answer: "Yes. Image Resizer processes everything locally in your browser. Your files and data never leave your device and are not stored on any server." },
      { question: "Do I need to install any software?", answer: "No. You can use this tool completely online from any modern web browser on your desktop or mobile device." },
      { question: "Is this tool completely free?", answer: "Yes, Image Resizer is 100% free to use with no hidden costs, no registration required, and no usage limits." }
    ],
  },
  {
    id: "jpg-to-png",
    slug: "jpg-to-png",
    name: "JPG to PNG Converter",
    shortDescription: "Convert JPG images to transparent PNGs.",
    fullDescription: "Convert your JPG images to PNG format securely in your browser.",
    category: "image",
    subCategory: "CONVERT IMAGE",
    iconName: "ImagePlus",
    tags: ["image", "converter", "jpg", "png"],
    intentKeywords: ["jpg to png", "convert to png"],
    isClientSide: true,
    isNew: false,
    howToSteps: [
      { title: "1. Select or Enter Data", description: "Upload your file or paste your text/data directly into the browser." },
      { title: "2. Adjust Settings", description: "Configure the specific options for your task to get the perfect result." },
      { title: "3. Download or Copy", description: "Instantly copy the result or download the processed file securely to your device." }
    ],
    features: [
      { title: "100% Client-Side Processing", description: "Everything runs directly in your browser. No files or data are ever uploaded to external servers." },
      { title: "Lightning Fast", description: "Instant results without waiting for uploads, downloads, or queue times." },
      { title: "No Watermarks or Limits", description: "Completely free to use without restrictions, hidden fees, or annoying watermarks." }
    ],
    faqs: [
      { question: "Is my data secure?", answer: "Yes. JPG to PNG Converter processes everything locally in your browser. Your files and data never leave your device and are not stored on any server." },
      { question: "Do I need to install any software?", answer: "No. You can use this tool completely online from any modern web browser on your desktop or mobile device." },
      { question: "Is this tool completely free?", answer: "Yes, JPG to PNG Converter is 100% free to use with no hidden costs, no registration required, and no usage limits." }
    ],
  },

  // -----------------------------------------------------
  // 4. Utility Tools
  // -----------------------------------------------------
  {
    id: "password-generator",
    slug: "password-generator",
    name: "Password Generator",
    shortDescription: "Generate cryptographically secure passwords and readable passphrases.",
    fullDescription: "Create unbreakable, cryptographically randomized passwords and multi-word passphrases using the Web Crypto API. Includes password entropy scoring, customizable character sets, and instant copy.",
    category: "utility",
    subCategory: "SECURITY",
    iconName: "ShieldAlert",
    tags: ["password", "generator", "security", "passphrase", "crypto", "random"],
    intentKeywords: [
      "strong password generator",
      "random secure password",
      "generate password with symbols",
      "passphrase generator",
      "safe password creator",
    ],
    isPopular: true,
    isClientSide: true,
    howToSteps: [
      {
        title: "1. Choose Length & Rules",
        description: "Set your desired password length (8-64 characters) and toggle uppercase, lowercase, numbers, or symbols.",
      },

      {

        title: "2. Check Strength Meter",

        description: "Review the real-time entropy calculation and estimated brute-force crack time.",

      },

      {

        title: "3. Copy Securely",

        description: "Click the copy button to place your new secure password on your clipboard without logging it anywhere.",

      },

    ],

    features: [

      {

        title: "Web Crypto CSPRNG",

        description: "Uses browser crypto.getRandomValues() for true cryptographic entropy, preventing pseudorandom pattern predictability.",

      },

      {

        title: "Zero Logging Guarantee",

        description: "Passwords are generated in volatile memory and destroyed on tab close. Nothing is ever sent to a server.",

      },

      {

        title: "Readable Passphrase Mode",

        description: "Generate memorable Diceware-style multi-word phrases for easy recall with maximum entropy.",

      },

    ],

    faqs: [

      {

        question: "How secure is this generator?",

        answer: "It utilizes the browser's native window.crypto API, which provides cryptographically strong pseudo-random data on par with top password managers.",

      },

      {

        question: "Is the generated password saved in any database?",

        answer: "Never. The logic is strictly executed inside your browser. No passwords, clicks, or input parameters are transmitted anywhere.",

      },

    ],

  },

  {

    id: "word-counter",

    slug: "word-counter",

    name: "Word Counter",

    shortDescription: "Real-time word, character, sentence, paragraph, and reading time counter.",

    fullDescription: "Analyze your writing instantly with comprehensive statistics: word count, character count (with/without spaces), reading time, speaking time, and keyword density breakdown.",

    category: "utility",
    subCategory: "TEXT & WRITING",

    iconName: "FileText",

    tags: ["word counter", "character count", "reading time", "text analyzer", "essay checker"],

    intentKeywords: [

      "online word counter",

      "character counter for essays",

      "word count for twitter / linkedin",

      "reading time calculator",

      "sentence and paragraph counter",

    ],

    isPopular: true,

    isClientSide: true,

    howToSteps: [

      {

        title: "1. Paste or Type Text",

        description: "Enter your article, assignment, or social media post into the editor box.",

      },

      {

        title: "2. Inspect Live Stats",

        description: "View real-time metric updates for word count, character counts, reading duration, and sentence structure.",

      },

      {

        title: "3. Transform or Copy",

        description: "Apply one-click quick transformations (uppercase, lowercase, clean spaces) and copy the result.",

      },

    ],

    features: [

      {

        title: "Instant Real-Time Metrics",

        description: "Calculates statistics as you type without lag, even with 50,000+ words of text.",

      },

      {

        title: "Social Media Character Limits",

        description: "Live visual indicators for Twitter/X, Instagram, LinkedIn, and Meta post length limits.",

      },

      {

        title: "Reading & Speaking Duration",

        description: "Accurately estimates reading time (200 wpm standard) and speech presentation time (130 wpm).",

      },

    ],

    faqs: [

      {

        question: "Is there a limit on text length?",

        answer: "No. You can paste entire book chapters or lengthy academic essays without any restrictions.",

      },

      {

        question: "Does it save my written content?",

        answer: "No. All text stays strictly on your local browser tab and disappears when you clear or refresh.",

      },

    ],

  },



  // -----------------------------------------------------

  // 5. SEO Tools

  // -----------------------------------------------------

  {

    id: "meta-tag-checker",

    slug: "meta-tag-checker",

    name: "Meta Tag Checker",

    shortDescription: "Analyze and preview website meta tags.",

    fullDescription: "Inspect the meta tags of any URL to see how it appears on Google and social media.",

    category: "marketing",
    subCategory: "SEO & META",

    iconName: "Tags",

    tags: ["seo", "meta tags", "preview"],

    intentKeywords: ["meta tag checker", "check website tags"],

    isClientSide: true,

    isNew: false,

    howToSteps: [
      { title: "1. Select or Enter Data", description: "Upload your file or paste your text/data directly into the browser." },
      { title: "2. Adjust Settings", description: "Configure the specific options for your task to get the perfect result." },
      { title: "3. Download or Copy", description: "Instantly copy the result or download the processed file securely to your device." }
    ],

    features: [
      { title: "100% Client-Side Processing", description: "Everything runs directly in your browser. No files or data are ever uploaded to external servers." },
      { title: "Lightning Fast", description: "Instant results without waiting for uploads, downloads, or queue times." },
      { title: "No Watermarks or Limits", description: "Completely free to use without restrictions, hidden fees, or annoying watermarks." }
    ],

    faqs: [
      { question: "Is my data secure?", answer: "Yes. Meta Tag Checker processes everything locally in your browser. Your files and data never leave your device and are not stored on any server." },
      { question: "Do I need to install any software?", answer: "No. You can use this tool completely online from any modern web browser on your desktop or mobile device." },
      { question: "Is this tool completely free?", answer: "Yes, Meta Tag Checker is 100% free to use with no hidden costs, no registration required, and no usage limits." }
    ],

  },




  {
    id: "link-campaigns",
    slug: "link-campaigns",
    name: "Link Campaigns",
    shortDescription: "Group tracked links and view aggregate performance.",
    fullDescription: "Group multiple shortened or tracked links under a named campaign. View aggregate click performance, top-performing links, and compare traffic across all links in the campaign.",
    category: "marketing",
    subCategory: "LINKS",
    iconName: "FolderKanban",
    tags: ["campaigns", "links", "analytics", "tracking", "marketing"],
    intentKeywords: ["group links", "campaign analytics", "aggregate clicks", "track marketing campaign"],
    isClientSide: false,
    isNew: true,
    howToSteps: [
      { title: "1. Create Campaign", description: "Name your campaign and set optional start and end dates." },
      { title: "2. Add Links", description: "Select existing tracked links to include in this campaign." },
      { title: "3. View Analytics", description: "See aggregate clicks and compare the performance of each link." }
    ],
    features: [
      { title: "Aggregate Metrics", description: "See the total clicks and unique visitors across all links in your campaign." },
      { title: "Link Comparison", description: "Quickly identify which link is driving the most traffic within your campaign." }
    ],
    faqs: [
      { question: "Do I need to create new links?", answer: "No, you can group any existing tracked links into a campaign." },
      { question: "Can a link belong to multiple campaigns?", answer: "Yes, you can add the same link to multiple campaigns for different tracking purposes." }
    ],
  },
  {
    id: "splash-pages",
    slug: "splash-pages",
    name: "Custom Splash Pages",
    shortDescription: "Create branded interstitial splash pages with countdown timers.",
    fullDescription: "Design custom splash pages that display your branding, a custom message, and a countdown timer before redirecting visitors to their final destination. Perfect for sponsored links, important announcements, or ad networks.",
    category: "marketing",
    subCategory: "PAGES",
    iconName: "MonitorPlay",
    tags: ["splash", "landing", "redirect", "interstitial", "marketing", "countdown"],
    intentKeywords: ["create splash page", "interstitial ad", "countdown redirect", "branded redirect"],
    isClientSide: true,
    isNew: true,
    howToSteps: [
      { title: "Design Splash", description: "Set your headline, subtext, logo, and background color." },
      { title: "Set Destination", description: "Enter the URL where visitors will be redirected." },
      { title: "Configure Timer", description: "Choose the countdown duration and whether skipping is allowed." },
      { title: "Share Link", description: "Copy your unique splash page link and share it." }
    ],
    features: [
      { title: "Custom Branding", description: "Upload your logo and choose colors that match your brand." },
      { title: "Countdown Timer", description: "Keep visitors engaged before sending them to the destination." },
      { title: "Skip Option", description: "Optionally allow users to skip the timer and proceed immediately." }
    ],
    faqs: [
      { question: "What is a splash page?", answer: "A splash page is an interstitial screen shown to visitors before they reach their final destination. It's often used for important announcements, age gates, or branding." },
      { question: "Can I track views?", answer: "Currently, splash pages do not have built-in analytics, but you can use our Link Shortener as the destination URL to track clicks." }
    ],
  },
  {
    id: "link-shortener",
    isHidden: true,
    slug: "link-shortener",
    name: "Link Shortener",
    shortDescription: "Branded short URLs with real-time click tracking and custom domains.",
    fullDescription: "Create branded short URLs with real-time click tracking and custom domains to boost your marketing efforts.",
    category: "marketing",
    subCategory: "LINKS",
    iconName: "Link",
    tags: ["link", "shortener", "url", "marketing"],
    intentKeywords: ["url shortener", "shorten link"],
    isClientSide: true,
    isNew: false,
    howToSteps: [
      { title: "1. Paste Your Long URL", description: "Enter any long, ugly link that you want to shorten and track." },
      { title: "2. Customize Your Link", description: "Add a custom alias, password protection, or expiration date." },
      { title: "3. Share & Track", description: "Share your branded link and view real-time analytics on every click." }
    ],
    features: [
      { title: "Link Customization", description: "Custom aliases and domains to build trust and increase click-through rates." },
      { title: "Custom Landing Page", description: "Create a custom landing page to promote your product or service." },
      { title: "CTA Overlays", description: "Use our overlay tool to display unobtrusive notifications, polls, or contact forms on the target website." },
      { title: "Password Protection", description: "Secure your links with passwords to restrict access to authorized users only." },
      { title: "Custom Expiration", description: "Set links to expire automatically after a certain date or a specific number of clicks." },
      { title: "Link Masking", description: "Hide the original destination URL to protect affiliate links or hide complex parameters." }
    ],
    faqs: [
      { question: "Can I use my own domain?", answer: "Yes, you can easily connect your own custom domain to create fully branded short links." },
      { question: "What kind of analytics do I get?", answer: "We provide comprehensive real-time data including clicks, unique visitors, referrers, locations, and device types." },
      { question: "Is my data secure?", answer: "Absolutely. All links and analytics are securely stored and processed in compliance with modern privacy standards." }
    ],
  },
  {
    id: "qr-generator",
    slug: "qr-codes",
    name: "QR Codes",
    shortDescription: "Dynamic QR codes tied to short links — update destinations without reprinting.",
    fullDescription: "Generate dynamic QR codes tied to short links. Update destinations without reprinting your codes.",
    category: "marketing",
    subCategory: "CODE GENERATION",
    iconName: "QrCode",
    tags: ["qr", "qrcode", "generator", "marketing"],
    intentKeywords: ["qr code generator", "create qr code"],
    isClientSide: true,
    isNew: false,
    howToSteps: [
      { title: "1. Select or Enter Data", description: "Upload your file or paste your text/data directly into the browser." },
      { title: "2. Adjust Settings", description: "Configure the specific options for your task to get the perfect result." },
      { title: "3. Download or Copy", description: "Instantly copy the result or download the processed file securely to your device." }
    ],
    features: [
      { title: "100% Client-Side Processing", description: "Everything runs directly in your browser. No files or data are ever uploaded to external servers." },
      { title: "Lightning Fast", description: "Instant results without waiting for uploads, downloads, or queue times." },
      { title: "No Watermarks or Limits", description: "Completely free to use without restrictions, hidden fees, or annoying watermarks." }
    ],
    faqs: [
      { question: "Is my data secure?", answer: "Yes. QR Codes processes everything locally in your browser. Your files and data never leave your device and are not stored on any server." },
      { question: "Do I need to install any software?", answer: "No. You can use this tool completely online from any modern web browser on your desktop or mobile device." },
      { question: "Is this tool completely free?", answer: "Yes, QR Codes is 100% free to use with no hidden costs, no registration required, and no usage limits." }
    ],
  },
  {
    id: "utm-builder",
    slug: "utm-builder",
    name: "UTM Builder",
    shortDescription: "Generate UTM-tagged campaign URLs to track your marketing traffic in analytics.",
    fullDescription: "Create perfectly formatted UTM campaign URLs in seconds. Add utm_source, utm_medium, utm_campaign, and optional term and content parameters to any link so you can measure exactly which campaigns drive clicks, signups, and revenue in Google Analytics or any analytics platform.",
    category: "marketing",
    subCategory: "LINKS",
    iconName: "Link2",
    tags: ["utm", "campaign", "url", "tracking", "analytics", "marketing", "google analytics", "utm builder"],
    intentKeywords: [
      "utm builder",
      "utm link generator",
      "campaign url builder",
      "google analytics url builder",
      "add utm parameters to url",
      "utm tag generator",
      "create tracking link",
    ],
    isClientSide: true,
    isNew: true,
    howToSteps: [
      { title: "1. Enter Your URL", description: "Paste the landing page URL you want to tag with campaign parameters." },
      { title: "2. Fill in UTM Parameters", description: "Add source, medium, campaign name, and optionally term and content to identify your traffic." },
      { title: "3. Copy & Share", description: "Copy the generated UTM link and use it in your ads, emails, or social posts to track performance." },
    ],
    features: [
      { title: "Live URL Preview", description: "See your tagged URL update in real-time as you type, with proper URL encoding for special characters." },
      { title: "Smart URL Handling", description: "Automatically handles URLs that already contain query parameters, protocols, and special characters." },
      { title: "Recent URLs History", description: "Your last 5 generated URLs are saved locally for quick access — no account required." },
    ],
    faqs: [
      { question: "What are UTM parameters?", answer: "UTM (Urchin Tracking Module) parameters are tags you add to URLs so analytics platforms like Google Analytics can tell you exactly where your visitors came from, what campaign brought them, and which link they clicked." },
      { question: "Is my data secure?", answer: "Yes. The UTM Builder runs 100% in your browser. No URLs or campaign data are ever sent to a server." },
      { question: "Do I need Google Analytics to use this?", answer: "No. UTM parameters work with virtually any analytics platform — Google Analytics, Mixpanel, Plausible, Matomo, and more." },
      { question: "Can I use URLs that already have query parameters?", answer: "Yes. The tool intelligently appends UTM parameters to URLs that already contain a query string without breaking existing parameters." },
    ],
  },
  {
    id: "link-analytics",
    slug: "link-analytics",
    name: "Link Analytics",
    shortDescription: "Track clicks on shortened links and view detailed analytics dashboards.",
    fullDescription: "Create trackable short links and monitor every click in real time. View total clicks, unique visitors, top referrers, device types, and country breakdowns with beautiful interactive charts. Perfect for marketers, content creators, and anyone who needs to understand how their links perform.",
    category: "marketing",
    subCategory: "LINKS",
    iconName: "BarChart3",
    tags: ["link", "analytics", "tracking", "clicks", "short url", "campaign", "marketing"],
    intentKeywords: [
      "link click tracker",
      "url analytics",
      "track link clicks",
      "link performance",
      "click tracking tool",
      "short link analytics",
    ],
    isClientSide: false,
    isPopular: false,
    isNew: true,
    howToSteps: [
      { title: "1. Paste Your URL", description: "Enter any URL you want to track. We generate a unique short code for it." },
      { title: "2. Share Your Tracked Link", description: "Copy the shortened link and share it anywhere — social media, email, ads." },
      { title: "3. View Analytics", description: "Watch clicks roll in. See time-series charts, top referrers, devices, and countries." }
    ],
    features: [
      { title: "Real-Time Click Tracking", description: "Every click is recorded instantly with referrer, device, and location data." },
      { title: "Beautiful Analytics Dashboard", description: "Interactive charts showing clicks over time, top referrers, and geographic breakdowns." },
      { title: "Unlimited Tracked Links", description: "Create as many tracked links as you need — completely free with no usage caps." }
    ],
    faqs: [
      { question: "How does click tracking work?", answer: "When someone clicks your tracked link, we record the timestamp, referrer, device type, and approximate country before redirecting them to the original URL." },
      { question: "Is there a limit on tracked links?", answer: "No. You can create unlimited tracked links and view analytics for all of them." },
      { question: "Do I need an account?", answer: "Yes, you need a free NeedTools account to create and manage your tracked links." }
    ],
  },
  {
    id: "bio-pages",
    slug: "bio-pages",
    name: "Bio Pages",
    shortDescription: "Create a beautiful link-in-bio page to share all your important links in one place.",
    fullDescription: "Build your own customizable link-in-bio page in seconds. Add your name, avatar, bio, and as many links as you want. Choose from elegant themes, then share a single URL that showcases everything. Perfect for social media profiles, creators, freelancers, and businesses.",
    category: "marketing",
    subCategory: "LINKS",
    iconName: "UserCircle",
    tags: ["bio", "link in bio", "linktree", "landing page", "profile", "social media", "creator"],
    intentKeywords: [
      "link in bio tool",
      "create bio page",
      "linktree alternative",
      "bio link page",
      "social media landing page",
      "free link in bio",
    ],
    isClientSide: false,
    isPopular: false,
    isNew: true,
    howToSteps: [
      { title: "1. Set Up Your Profile", description: "Add your display name, avatar URL, and a short bio to personalize your page." },
      { title: "2. Add Your Links", description: "Add, reorder, and customize the links you want to share with the world." },
      { title: "3. Share Your Bio Page", description: "Copy your unique public URL and add it to your social media profiles." }
    ],
    features: [
      { title: "Live Preview", description: "See exactly how your bio page will look on mobile as you build it — changes appear instantly." },
      { title: "Multiple Themes", description: "Choose from elegant light and dark themes to match your personal brand." },
      { title: "Drag & Reorder Links", description: "Easily rearrange your links with up/down controls to put the most important ones first." }
    ],
    faqs: [
      { question: "Is my bio page public?", answer: "Yes! Once you create a bio page, anyone with the link can view it. It's designed to be shared on social media." },
      { question: "Can I change my slug/URL?", answer: "Your slug is set when you create the page. Each slug must be unique across all NeedTools users." },
      { question: "How many links can I add?", answer: "You can add as many links as you want — there's no limit." }
    ],
  },
  {
    id: "tracking-pixels",
    slug: "tracking-pixels",
    name: "Tracking Pixels",
    shortDescription: "Manage and deploy tracking pixels for your marketing campaigns.",
    fullDescription: "Centralize your marketing pixels (Meta, GA4, TikTok, custom) and deploy them to track campaign conversions across your shortened links and bio pages.",
    category: "marketing",
    subCategory: "LINKS",
    iconName: "Target",
    tags: ["pixel", "tracking", "marketing", "analytics", "meta pixel", "facebook pixel", "google analytics", "ga4", "tiktok"],
    intentKeywords: ["tracking pixels", "add facebook pixel", "marketing tracker", "pixel manager"],
    isClientSide: false,
    isNew: true,
    howToSteps: [
      { title: "1. Select Provider", description: "Choose Meta, GA4, TikTok, or Custom Script." },
      { title: "2. Add Pixel Details", description: "Enter your pixel ID or custom code snippet." },
      { title: "3. Deploy & Track", description: "Enable the pixel to automatically fire on your associated marketing links." }
    ],
    features: [
      { title: "Centralized Management", description: "Manage all your tracking pixels in one easy-to-use dashboard." },
      { title: "Custom Scripts", description: "Support for custom HTML/JS snippets beyond standard providers." }
    ],
    faqs: [
      { question: "Which providers are supported?", answer: "We natively support Meta (Facebook), Google Analytics 4, and TikTok, plus custom scripts for any other platform." },
      { question: "Where do these pixels fire?", answer: "Active pixels will fire on any short links or bio pages you create, giving you full visibility into your traffic." }
    ]
  },

  {
    id: "cta-overlays",
    slug: "cta-overlays",
    name: "CTA Overlays",
    shortDescription: "Create call-to-action banners, corner widgets, or modals for your tracked links.",
    fullDescription: "Design eye-catching CTA overlays — full-width banners, floating corner widgets, or centered modals — and attach them to any shared or tracked link. Customize message, button, colors, and position with a live preview, then generate a snippet or link parameter to apply the overlay on any destination page.",
    category: "marketing",
    subCategory: "ENGAGEMENT",
    iconName: "Megaphone",
    tags: ["cta", "overlay", "banner", "popup", "call to action", "marketing", "engagement", "widget", "modal"],
    intentKeywords: [
      "cta overlay",
      "call to action banner",
      "website overlay creator",
      "popup banner generator",
      "corner widget",
      "add cta to link",
      "overlay on shared link",
    ],
    isClientSide: true,
    isNew: true,
    howToSteps: [
      { title: "1. Choose Overlay Type", description: "Pick between a full-width banner, a floating corner widget, or a centered modal dialog." },
      { title: "2. Customize Content & Style", description: "Write your message, set button text and URL, choose colors and position with live preview." },
      { title: "3. Copy & Apply", description: "Grab the link parameter or embed snippet to display the overlay on any destination page." },
    ],
    features: [
      { title: "Live Visual Preview", description: "See exactly how your overlay will look over a real page in a mock browser frame — updates instantly as you type." },
      { title: "Multiple Overlay Styles", description: "Choose from banners, floating corner widgets, or modal dialogs to match your campaign goals." },
      { title: "One-Click Snippets", description: "Generate a ready-to-paste HTML embed snippet or a simple link parameter to apply the overlay anywhere." },
    ],
    faqs: [
      { question: "How do I apply an overlay to a link?", answer: "Append the generated ?cta=<id> parameter to any tracked or shortened link. When the link is visited, the overlay is injected over the destination page." },
      { question: "Can I customize the colors?", answer: "Yes! Pick from preset color themes or use the full color pickers to set any background and text color combination." },
      { question: "Is this tool free?", answer: "Yes, CTA Overlays is 100% free to use with no limits or watermarks." },
    ],
  },




  // -----------------------------------------------------
  // 7. Developer & Converter Tools (Newly Unlocked!)
  // -----------------------------------------------------
  {
    id: "json-formatter",
    slug: "json-formatter",
    name: "JSON Formatter",
    shortDescription: "Format, validate, and beautify JSON data.",
    fullDescription: "Instantly format, validate, and beautify your JSON data. Catch syntax errors and make your JSON readable with syntax highlighting.",
    category: "developer",
    subCategory: "FORMATTING",
    iconName: "Code",
    tags: ["json", "formatter", "validator", "beautifier"],
    intentKeywords: ["format json", "validate json", "beautify json"],
    isClientSide: true,
    isNew: false,
    howToSteps: [
      { title: "1. Paste JSON", description: "Paste your raw JSON string into the editor." },
      { title: "2. Format", description: "Click format to instantly validate and beautify the JSON." },
      { title: "3. Copy", description: "Copy the formatted JSON back to your clipboard." }
    ],
    features: [
      { title: "Client-Side Processing", description: "Everything runs locally. Your JSON data is never sent to a server." },
      { title: "Syntax Error Highlighting", description: "Quickly spot where your JSON has missing brackets or quotes." }
    ],
    faqs: [
      { question: "Is my JSON data secure?", answer: "Yes. All formatting and validation happens in your browser." }
    ]
  },
  {
    id: "gradient-generator",
    slug: "gradient-generator",
    name: "CSS Gradient Generator",
    shortDescription: "Create beautiful CSS gradients easily.",
    fullDescription: "Design stunning linear and radial CSS gradients. Preview in real-time and copy the exact CSS code for your project.",
    category: "developer",
    subCategory: "CSS TOOLS",
    iconName: "Palette",
    tags: ["css", "gradient", "generator", "design"],
    intentKeywords: ["css gradient generator", "linear gradient", "radial gradient"],
    isClientSide: true,
    isNew: false,
    howToSteps: [
      { title: "1. Pick Colors", description: "Choose your start and end colors." },
      { title: "3. Copy CSS", description: "Copy the generated CSS snippet to your clipboard." }
    ],
    features: [
      { title: "Live Preview", description: "See your gradient update in real-time." },
      { title: "Cross-Browser CSS", description: "Generates CSS that works across all modern browsers." }
    ],
    faqs: [
      { question: "Is this tool free?", answer: "Yes, completely free and unlimited." }
    ]
  },
  {
    id: "box-shadow-generator",
    slug: "box-shadow-generator",
    name: "Box Shadow Generator",
    shortDescription: "Generate CSS box shadows visually.",
    fullDescription: "Create complex CSS box shadows with an intuitive visual interface. Adjust offsets, blur, spread, and color.",
    category: "developer",
    subCategory: "CSS TOOLS",
    iconName: "Layout",
    tags: ["css", "box-shadow", "generator", "design"],
    intentKeywords: ["css box shadow generator", "shadow effect css"],
    isClientSide: true,
    isNew: false,
    howToSteps: [
      { title: "1. Tweak Sliders", description: "Adjust horizontal/vertical offset, blur, and spread." },
      { title: "2. Pick Color", description: "Select the shadow color and opacity." },
      { title: "3. Copy CSS", description: "Copy the CSS code instantly." }
    ],
    features: [
      { title: "Visual Editing", description: "See the shadow change instantly on a preview box." }
    ],
    faqs: [
      { question: "Can I do inset shadows?", answer: "Yes, toggle the inset option easily." }
    ]
  },
  {
    id: "color-converter",
    slug: "color-converter",
    name: "Color Converter",
    shortDescription: "Convert between HEX, RGB, and HSL formats.",
    fullDescription: "Instantly convert color codes between HEX, RGB, HSL, and CMYK formats. Pick a color to see all its variations.",
    category: "converter",
    subCategory: "COLORS",
    iconName: "Pipette",
    tags: ["color", "converter", "hex", "rgb", "hsl"],
    intentKeywords: ["hex to rgb", "rgb to hex", "color converter"],
    isClientSide: true,
    isNew: false,
    howToSteps: [
      { title: "1. Enter Color", description: "Type a HEX, RGB, or HSL value, or use the color picker." },
      { title: "2. View Formats", description: "See the color translated into all other formats automatically." },
      { title: "3. Copy", description: "Click to copy the specific format you need." }
    ],
    features: [
      { title: "Real-time Conversion", description: "Values update instantly as you type or pick." }
    ],
    faqs: [
      { question: "Does it support Alpha/Transparency?", answer: "Yes, RGBA and HSLA conversions are supported." }
    ]
  },
  {
    id: "timestamp-converter",
    slug: "timestamp-converter",
    name: "Unix Timestamp Converter",
    shortDescription: "Convert Unix timestamps to readable dates.",
    fullDescription: "Convert Unix epoch timestamps to human-readable dates, or convert dates back to Unix timestamps.",
    category: "developer",
    subCategory: "TIME & DATES",
    iconName: "Clock",
    tags: ["timestamp", "unix", "epoch", "converter"],
    intentKeywords: ["unix timestamp converter", "epoch to date"],
    isClientSide: true,
    isNew: false,
    howToSteps: [
      { title: "1. Enter Timestamp", description: "Paste a Unix timestamp (seconds or milliseconds)." },
      { title: "2. View Dates", description: "See the local time, UTC time, and ISO formats instantly." }
    ],
    features: [
      { title: "Auto-detect MS", description: "Automatically detects if your timestamp is in seconds or milliseconds." }
    ],
    faqs: [
      { question: "Is my timezone supported?", answer: "It automatically uses your browser's local timezone." }
    ]
  },
  {
    id: "markdown-previewer",
    slug: "markdown-previewer",
    name: "Markdown Previewer",
    shortDescription: "Live editor and preview for Markdown.",
    fullDescription: "Write Markdown and see it rendered to HTML in real-time. Export or copy the rendered HTML easily.",
    category: "developer",
    subCategory: "TEXT",
    iconName: "FileEdit",
    tags: ["markdown", "editor", "preview", "html"],
    intentKeywords: ["markdown previewer", "markdown to html"],
    isClientSide: true,
    isNew: false,
    howToSteps: [
      { title: "1. Type Markdown", description: "Write standard GitHub-flavored Markdown in the editor." },
      { title: "2. Preview", description: "See the live HTML preview side-by-side." }
    ],
    features: [
      { title: "GitHub Flavored", description: "Supports tables, code blocks, and standard GFM features." }
    ],
    faqs: [
      { question: "Is the text saved?", answer: "No, everything runs purely locally in the browser tab." }
    ]
  },
  {
    id: "hash-generator",
    slug: "hash-generator",
    name: "Hash Generator",
    shortDescription: "Generate MD5, SHA-1, SHA-256 hashes.",
    fullDescription: "Securely generate cryptographic hashes (MD5, SHA-1, SHA-256, SHA-512) from your text in the browser.",
    category: "utility",
    subCategory: "SECURITY",
    iconName: "Fingerprint",
    tags: ["hash", "md5", "sha256", "sha512", "crypto"],
    intentKeywords: ["md5 hash generator", "sha256 calculator"],
    isClientSide: true,
    isNew: false,
    howToSteps: [
      { title: "1. Enter Text", description: "Type or paste the text you want to hash." },
      { title: "2. Choose Algorithm", description: "View MD5, SHA-1, SHA-256, and SHA-512 results instantly." }
    ],
    features: [
      { title: "Client-side Hashing", description: "Uses Web Crypto API so your text is never sent over the network." }
    ],
    faqs: [
      { question: "Can hashes be reversed?", answer: "No, cryptographic hashes are one-way functions." }
    ]
  },
  {
    id: "base64-converter",
    slug: "base64-converter",
    name: "Base64 Encoder/Decoder",
    shortDescription: "Encode and decode Base64 strings.",
    fullDescription: "Easily encode plain text into Base64 or decode Base64 strings back to readable text.",
    category: "converter",
    subCategory: "DATA",
    iconName: "Binary",
    tags: ["base64", "encode", "decode", "converter"],
    intentKeywords: ["base64 encoder", "base64 decoder"],
    isClientSide: true,
    isNew: false,
    howToSteps: [
      { title: "1. Paste Text", description: "Paste your text or Base64 string." },
      { title: "2. Choose Action", description: "Select Encode or Decode." }
    ],
    features: [
      { title: "Fast & Local", description: "Completely local encoding/decoding without server communication." }
    ],
    faqs: [
      { question: "Is there a length limit?", answer: "No strict limit, but bounded by browser memory." }
    ]
  },
  {
    id: "case-converter",
    slug: "case-converter",
    name: "Case Converter",
    shortDescription: "Convert text to uppercase, lowercase, title case.",
    fullDescription: "Quickly convert blocks of text into UPPERCASE, lowercase, Title Case, camelCase, PascalCase, or snake_case.",
    category: "utility",
    subCategory: "TEXT & WRITING",
    iconName: "Type",
    tags: ["case", "converter", "uppercase", "lowercase"],
    intentKeywords: ["uppercase converter", "title case converter", "change case"],
    isClientSide: true,
    isNew: false,
    howToSteps: [
      { title: "1. Paste Text", description: "Paste the text you want to change." },
      { title: "2. Choose Case", description: "Click the buttons to convert into your desired case." }
    ],
    features: [
      { title: "Instant Conversion", description: "Text updates instantly." }
    ],
    faqs: [
      { question: "Is this free?", answer: "Yes, 100% free forever." }
    ]
  }
];

export function getToolBySlug(slug: string): ToolItem | undefined {
  return TOOLS_REGISTRY.find((tool) => tool.slug === slug);
}

export function getToolsByCategory(category: string): ToolItem[] {

  return TOOLS_REGISTRY.filter((tool) => tool.category === category);

}



export function getPopularTools(): ToolItem[] {

  return TOOLS_REGISTRY.filter((tool) => tool.isPopular);

}

