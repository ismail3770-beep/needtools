const fs = require('fs');
const file = 'src/app/[locale]/layout.tsx';
let content = fs.readFileSync(file, 'utf8');

// The original signature seems to be:
// export default function RootLayout({
//   children,
//   params: { locale }
// }: Readonly<{
//   children: React.ReactNode;
//   params: { locale: string };
// }>) {

content = content.replace(
  /export default function RootLayout\(\{[\s\S]*?\}\>\)\s*\{/,
  `export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;`
);

fs.writeFileSync(file, content);
