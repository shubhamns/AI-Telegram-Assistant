import dayjs from "dayjs";
export type Time12 = [string, string, string];
export const timeColumns = [
  Array.from({ length: 12 }, (_, i) => ({ label: String(i + 1).padStart(2, "0"), value: String(i + 1).padStart(2, "0") })),
  Array.from({ length: 60 }, (_, i) => ({ label: String(i).padStart(2, "0"), value: String(i).padStart(2, "0") })),
  [{ label: "AM", value: "AM" }, { label: "PM", value: "PM" }],
];
export function defaultTime(): Time12 {
  const now = dayjs();
  const h = now.hour();
  return [String(h % 12 || 12).padStart(2, "0"), now.format("mm"), h >= 12 ? "PM" : "AM"];
}
export function formatTime12(time: Time12): string {
  return `${time[0]}:${time[1]} ${time[2]}`;
}
export function to24Hour(time: Time12): { hour: number; minute: number } {
  const h12 = Number(time[0]);
  const hour = time[2] === "AM" ? (h12 === 12 ? 0 : h12) : (h12 === 12 ? 12 : h12 + 12);
  return { hour, minute: Number(time[1]) };
}
export function time12FromDate(d: Date): Time12 {
  const h = d.getHours();
  return [String(h % 12 || 12).padStart(2, "0"), String(d.getMinutes()).padStart(2, "0"), h >= 12 ? "PM" : "AM"];
}
export function scheduledAtIso(date: Date, time: Time12): string {
  const { hour, minute } = to24Hour(time);
  return dayjs(date).hour(hour).minute(minute).second(0).toISOString();
}
