const fs = require('fs');
let code = fs.readFileSync('src/app/[locale]/page.tsx', 'utf-8');

const s1 = 'export default function HomePage() {';
const r1 = `import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('HomePage');
`;

code = code.replace(s1, r1);
code = code.replace('Browse Tools by Category', "{t('title')}");
code = code.replace('Free, fast, and secure tools for your everyday tasks.', "{t('description')}");
code = code.replace('See All Tools', "{t('seeAll')}");

fs.writeFileSync('src/app/[locale]/page.tsx', code);
console.log('Page updated successfully');
