const fs = require('fs');
let code = fs.readFileSync('src/app/[locale]/layout.tsx', 'utf-8');
code = code.replace(
  'import { Navbar } from "@/components/layout/Navbar";',
  'import { Navbar } from "@/components/layout/Navbar";\nimport { HreflangTags } from "@/components/layout/HreflangTags";'
);
code = code.replace(
  '<head>',
  '<head>\n        <HreflangTags />'
);
fs.writeFileSync('src/app/[locale]/layout.tsx', code);
console.log('HreflangTags added to layout');
