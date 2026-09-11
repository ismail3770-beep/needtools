const fs = require('fs');

const locales = ['en', 'es', 'fr', 'de', 'pt', 'hi', 'ar', 'zh', 'bn', 'ru', 'ja', 'ko', 'it', 'nl', 'tr'];

const baseTranslations = {
  HomePage: {
    title: 'Browse Tools by Category',
    description: 'Free, fast, and secure tools for your everyday tasks.',
    seeAll: 'See All Tools'
  }
};

const translations = {
  en: baseTranslations,
  es: { HomePage: { title: 'Explorar herramientas', description: 'Herramientas gratis y seguras', seeAll: 'Ver todo' } },
  fr: { HomePage: { title: 'Parcourir les outils', description: 'Outils gratuits et rapides', seeAll: 'Voir tout' } },
  bn: { HomePage: { title: 'বিভাগ অনুযায়ী সরঞ্জাম ব্রাউজ করুন', description: 'আপনার প্রতিদিনের কাজের জন্য বিনামূল্যে, দ্রুত এবং সুরক্ষিত সরঞ্জাম।', seeAll: 'সব সরঞ্জাম দেখুন' } },
  de: { HomePage: { title: 'Werkzeuge nach Kategorie', description: 'Kostenlose, schnelle und sichere Werkzeuge', seeAll: 'Alle ansehen' } },
  pt: { HomePage: { title: 'Procurar ferramentas', description: 'Ferramentas gratuitas e rápidas', seeAll: 'Ver tudo' } },
  hi: { HomePage: { title: 'उपकरण खोजें', description: 'मुफ्त, तेज और सुरक्षित उपकरण', seeAll: 'सभी देखें' } },
  ar: { HomePage: { title: 'تصفح الأدوات', description: 'أدوات مجانية وسريعة', seeAll: 'عرض الكل' } },
  zh: { HomePage: { title: '按类别浏览工具', description: '免费、快速、安全的日常工具。', seeAll: '查看所有工具' } },
  ru: { HomePage: { title: 'Обзор инструментов', description: 'Бесплатные, быстрые и безопасные инструменты', seeAll: 'Посмотреть все' } },
  ja: { HomePage: { title: 'ツールを閲覧', description: '無料で高速、安全なツール', seeAll: 'すべて表示' } },
  ko: { HomePage: { title: '도구 찾아보기', description: '무료이고 빠르며 안전한 도구', seeAll: '모두 보기' } },
  it: { HomePage: { title: 'Sfoglia gli strumenti', description: 'Strumenti gratuiti e sicuri', seeAll: 'Vedi tutti' } },
  nl: { HomePage: { title: 'Blader door tools', description: 'Gratis, snelle en veilige tools', seeAll: 'Bekijk alles' } },
  tr: { HomePage: { title: 'Araçlara Göz At', description: 'Ücretsiz, hızlı ve güvenli araçlar', seeAll: 'Tümünü Gör' } },
};

locales.forEach(locale => {
  const data = translations[locale] || baseTranslations;
  fs.writeFileSync("messages/" + locale + ".json", JSON.stringify(data, null, 2));
});

console.log('Messages created');
