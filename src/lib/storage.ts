const RECENT_TOOLS_KEY = "needtools_recent_tools";
const MAX_RECENT_ITEMS = 6;

export function getRecentTools(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_TOOLS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentTool(toolSlug: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getRecentTools().filter((slug) => slug !== toolSlug);
    const updated = [toolSlug, ...current].slice(0, MAX_RECENT_ITEMS);
    localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to update recent tools in localStorage", err);
  }
}
