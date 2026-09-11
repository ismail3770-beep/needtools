export interface PseoVariant {
  slug: string;
  name: string;
  type: "profession" | "device";
  modifierText: string;
}

export const PSEO_PROFESSIONS: PseoVariant[] = [
  { slug: "lawyers", name: "Lawyers", type: "profession", modifierText: "for Legal Professionals" },
  { slug: "students", name: "Students", type: "profession", modifierText: "for Students" },
  { slug: "teachers", name: "Teachers", type: "profession", modifierText: "for Educators" },
  { slug: "designers", name: "Designers", type: "profession", modifierText: "for Designers" },
  { slug: "developers", name: "Developers", type: "profession", modifierText: "for Developers" },
];

export const PSEO_DEVICES: PseoVariant[] = [
  { slug: "mac", name: "Mac", type: "device", modifierText: "on Mac" },
  { slug: "windows", name: "Windows", type: "device", modifierText: "on Windows" },
  { slug: "iphone", name: "iPhone", type: "device", modifierText: "on iPhone" },
  { slug: "android", name: "Android", type: "device", modifierText: "on Android" },
];

export const ALL_PSEO_VARIANTS = [...PSEO_PROFESSIONS, ...PSEO_DEVICES];

export function parsePseoSlug(fullSlug: string) {
  // Matches: [tool-slug]-for-[profession] OR [tool-slug]-on-[device]
  const professionMatch = fullSlug.match(/^(.*)-for-(.*)$/);
  if (professionMatch) {
    const baseToolSlug = professionMatch[1];
    const variantSlug = professionMatch[2];
    const variant = PSEO_PROFESSIONS.find(p => p.slug === variantSlug);
    if (variant) return { baseToolSlug, variant };
  }

  const deviceMatch = fullSlug.match(/^(.*)-on-(.*)$/);
  if (deviceMatch) {
    const baseToolSlug = deviceMatch[1];
    const variantSlug = deviceMatch[2];
    const variant = PSEO_DEVICES.find(d => d.slug === variantSlug);
    if (variant) return { baseToolSlug, variant };
  }

  return null;
}
