import type { Reminder } from "@/types/reminder";
import { formatDayLabel, isSameDay, isOverdue } from "@/utils/format";
export function sortByTime(list: Reminder[]) {
  return [...list].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
}
export function getTodayTasks(pending: Reminder[], done: Reminder[], now: Date) {
  const stillDue = pending.filter((r) => isSameDay(r.scheduledAt, now) && !isOverdue(r.scheduledAt, now));
  const finished = done.filter((r) => isSameDay(r.scheduledAt, now));
  return sortByTime([...stillDue, ...finished]);
}
export function groupRemindersByDay(reminders: Reminder[]) {
  return reminders.reduce<Record<string, Reminder[]>>((acc, r) => {
    const key = formatDayLabel(r.scheduledAt);
    if (!acc[key]) acc[key] = [];
    acc[key]!.push(r);
    return acc;
  }, {});
}
