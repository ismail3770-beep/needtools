import { ToolItem } from "@/types/tool";

export const TOOLS_REGISTRY: ToolItem[] = [
// -----------------------------------------------------
// 1. PDF Tools
// -----------------------------------------------------
{
id: "pdf-compressor",
slug: "pdf-compressor",
name: "PDF Compressor",
shortDescription: "Reduce the file size of your PDF documents instantly.",
fullDescription: "Our PDF Compressor allows you to reduce the file size of your PDF documents without losing quality, directly in your browser.",
category: "pdf",
subCategory: "OPTIMIZE PDF",
iconName: "Minimize",
tags: ["pdf", "compress", "shrink", "optimize"],
intentKeywords: ["compress pdf", "reduce pdf size"],
isClientSide: true,
isNew: false,
howToSteps: [],
features: [],
faqs: [],
},
{
id: "pdf-to-jpg",
slug: "pdf-to-jpg",
name: "PDF to JPG Converter",
shortDescription: "Convert PDF pages into high-quality JPG images.",
fullDescription: "Convert your PDF pages into individual JPG images directly in your browser. Complete privacy with zero server uploads.",
category: "pdf",
subCategory: "CONVERT FROM PDF",
iconName: "ImagePlus",
tags: ["pdf", "jpg", "converter"],
intentKeywords: ["pdf to jpg", "convert pdf to image"],
isClientSide: true,
isNew: false,
howToSteps: [],
features: [],
faqs: [],
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