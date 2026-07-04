export const TITLE_MAX_WORDS = 50;
export const NOTES_MAX_WORDS = 250;
export function countWords(value: string): number {
  const t = value.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}
export function enforceWordLimit(value: string, max: number): string {
  if (!value) return value;
  const words = value.trim().split(/\s+/);
  if (words.length <= max) return value;
  return words.slice(0, max).join(" ");
}
export function wordLimitRule(max: number, label: string) {
  return {
    validator: (_: unknown, value?: string) => {
      if (!value || countWords(value) <= max) return Promise.resolve();
      return Promise.reject(new Error(`${label} must be ${max} words or less`));
    },
  };
}
