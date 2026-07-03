interface StatCardProps {
  label: string;
  value: number | string;
  accent?: string;
}
export default function StatCard({ label, value, accent = "bg-white" }: StatCardProps) {
  return (
    <div className={`${accent} rounded-lg border border-slate-200 p-4 shadow-sm`}>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
