export const notifyOptions = [
  [{ label: "At time", value: "At time" }, { label: "5 min before", value: "5 min before" }, { label: "15 min before", value: "15 min before" }],
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
