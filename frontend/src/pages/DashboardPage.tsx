import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats } from "@/api/telegramApi";
import StatCard from "@/components/common/StatCard";
import LoadingState from "@/components/common/LoadingState";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import { formatDate } from "@/utils/format";
export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ["dashboard-stats"], queryFn: fetchDashboardStats });
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error instanceof Error ? error.message : "Failed to load dashboard"} />;
  if (!data) return <EmptyState message="No dashboard data" />;
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Conversations" value={data.totalConversations} />
        <StatCard label="Messages" value={data.totalMessages} />
        <StatCard label="Pending Reminders" value={data.pendingReminders} />
        <StatCard label="Sent Reminders" value={data.sentReminders} />
        <StatCard label="Failed Automations" value={data.failedAutomations} />
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <section className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold mb-3">Recent Conversations</h3>
          {data.recentConversations.length === 0 ? (
            <p className="text-sm text-slate-500">No conversations yet</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {data.recentConversations.map((c) => (
                <li key={c._id} className="flex justify-between">
                  <span>{c.firstName || c.telegramUsername || c.telegramChatId}</span>
                  <span className="text-slate-400">{formatDate(c.updatedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold mb-3">Upcoming Reminders</h3>
          {data.upcomingReminders.length === 0 ? (
            <p className="text-sm text-slate-500">No upcoming reminders</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {data.upcomingReminders.map((r) => (
                <li key={r._id} className="flex justify-between">
                  <span>{r.title}</span>
                  <span className="text-slate-400">{formatDate(r.scheduledAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold mb-3">Recent Automation Logs</h3>
          {data.recentLogs.length === 0 ? (
            <p className="text-sm text-slate-500">No logs yet</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {data.recentLogs.map((l) => (
                <li key={l._id} className={l.status === "failed" ? "text-red-600" : ""}>
                  {l.message}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
