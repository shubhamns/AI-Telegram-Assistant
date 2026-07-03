export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
export function formatDayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}
export function isSameDay(a: string, b: Date): boolean {
  return new Date(a).toDateString() === b.toDateString();
}
export function isOverdue(iso: string, now: Date = new Date()): boolean {
  return new Date(iso).getTime() < now.getTime();
}
export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
export function cn(...classes: (string | false | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
