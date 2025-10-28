export const normalize = (s?: string | null) => (s || '').trim();
export const ciEqual = (a: string, b: string) =>
  a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0;
