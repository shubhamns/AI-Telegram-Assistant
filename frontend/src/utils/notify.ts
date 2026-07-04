export const notifyWhenOptions = [
  [{ label: "At time", value: "At time" }, { label: "5 min before", value: "5 min before" }, { label: "15 min before", value: "15 min before" }],
];
export const notifyMsgCountOptions = [
  [{ label: "1 message", value: "1" }, { label: "2 messages", value: "2" }, { label: "3 messages", value: "3" }, { label: "4 messages", value: "4" }, { label: "5 messages", value: "5" }],
];
export function notifyToMinutes(label: string): number {
  if (label === "5 min before") return 5;
  if (label === "15 min before") return 15;
  return 0;
}
export function minutesToNotify(minutes: number): string {
  if (minutes === 5) return "5 min before";
  if (minutes === 15) return "15 min before";
  return "At time";
}
export function msgCountToLabel(count: number): string {
  const n = Math.min(Math.max(count || 1, 1), 5);
  return String(n);
}
export function labelToMsgCount(label: string): number {
  const n = Number(label);
  if (n >= 1 && n <= 5) return n;
  return 1;
}
