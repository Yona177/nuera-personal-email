// src/store/smallwins.ts
const KEY = "nuera:smallwins:v1";

export type SmallWinRecord = {
  ts: number;         // epoch ms
  actionId: string;   // e.g. 'stretch'
  done: boolean;      // whether user marked as done
};

export function loadSmallWins(): SmallWinRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSmallWins(records: SmallWinRecord[]) {
  localStorage.setItem(KEY, JSON.stringify(records));
}

export function appendSmallWin(actionId: string, done: boolean) {
  const all = loadSmallWins();
  all.push({ ts: Date.now(), actionId, done });
  saveSmallWins(all);
}

// A quick frequency map you can use to bias recommendations
export function smallWinsFrequency(): Record<string, number> {
  const all = loadSmallWins();
  return all.reduce((acc, r) => {
    acc[r.actionId] = (acc[r.actionId] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}
