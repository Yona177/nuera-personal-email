export type GratitudeItem = {
  id: string;             // uuid
  category?: string;      // e.g., "Family"
  what: string;           // user text (or transcript)
  why?: string;           // optional reason/meaning
  who?: string;           // optional person
  willAct?: boolean;      // plan to thank later
};

export type GratitudeEntry = {
  id: string;             // uuid
  createdAt: number;      // Date.now()
  items: GratitudeItem[]; // usually length 3
  moodBefore?: number;    // 1-5 (optional)
  moodAfter?: number;     // 1-5 (optional)
};
