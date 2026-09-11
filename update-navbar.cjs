const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf-8');
code = code.replace(
  'import { ThemeToggle } from "./ThemeToggle";',
  'import { ThemeToggle } from "./ThemeToggle";\nimport { LanguageSwitcher } from "./LanguageSwitcher";'
);
code = code.replace(
  '<ThemeToggle />',
  '<LanguageSwitcher />\n            <ThemeToggle />'
);
// Make sure to replace in the mobile menu as well if there's a second one
code = code.replace(
  '<ThemeToggle />',
  '<LanguageSwitcher />\n              <ThemeToggle />'
);
fs.writeFileSync('src/components/layout/Navbar.tsx', code);
console.log('Navbar updated');
