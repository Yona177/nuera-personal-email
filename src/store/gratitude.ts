import { GratitudeEntry } from "@/types/gratitude";

const KEY = "nuera:gratitude:entries";

export function loadGratitudeEntries(): GratitudeEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as GratitudeEntry[];
  } catch {
    return [];
  }
}

export function saveGratitudeEntry(entry: GratitudeEntry) {
  const all = loadGratitudeEntries();
  all.unshift(entry);
  localStorage.setItem(KEY, JSON.stringify(all));
}
