const fs = require('fs');
const file = 'src/tools-logic/pdf/PdfCompressorUI.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/import \{ useDropzone \} from "react-dropzone";\r?\n/, '');
content = content.replace(/import \{ ShareLinkButton \} from "@\/components\/tools\/ShareLinkButton";\r?\n/, '');
fs.writeFileSync(file, content);
