import { useQuery } from "@tanstack/react-query";
import { Card, Tag, List } from "antd-mobile";
import { RightOutline } from "antd-mobile-icons";
import { useNavigate } from "react-router-dom";
import { fetchTelegramStatus, fetchDashboardStats } from "@/api/telegramApi";
import FixedPageLayout from "@/components/common/FixedPageLayout";
import LoadingState from "@/components/common/LoadingState";
import ErrorState from "@/components/common/ErrorState";
export default function SettingsPage() {
  const navigate = useNavigate();
  const statusQuery = useQuery({ queryKey: ["telegram-status"], queryFn: fetchTelegramStatus });
  const statsQuery = useQuery({ queryKey: ["dashboard-stats"], queryFn: fetchDashboardStats });
  if (statusQuery.isLoading || statsQuery.isLoading) return <LoadingState />;
  if (statusQuery.error) return <ErrorState message={statusQuery.error.message} />;
  const status = statusQuery.data;
  const stats = statsQuery.data;
  const statItems = [
    { label: "Messages", value: stats?.totalMessages ?? 0 },
    { label: "Pending", value: stats?.pendingReminders ?? 0 },
    { label: "Sent", value: stats?.sentReminders ?? 0 },
    { label: "Chats", value: stats?.totalConversations ?? 0 },
  ];
  return (
    <FixedPageLayout
      header={<h2 className="greeting-name" style={{ margin: 0 }}>{status?.botUsername ? `@${status.botUsername}` : "Profile"}</h2>}
    >
      <List header="Menu" style={{ marginBottom: 12 }}>
        <List.Item prefix="📤" onClick={() => navigate("/send")} arrow={<RightOutline color="#8E8E8E" />}>Send to Telegram</List.Item>
        <List.Item prefix="✨" onClick={() => navigate("/brain-dump")} arrow={<RightOutline color="#8E8E8E" />}>Brain Dump</List.Item>
        <List.Item prefix="💬" onClick={() => navigate("/ai")} arrow={<RightOutline color="#8E8E8E" />}>Messages</List.Item>
        <List.Item prefix="📋" onClick={() => navigate("/reminders")} arrow={<RightOutline color="#8E8E8E" />}>Reminders</List.Item>
      </List>
      <Card title="Telegram" style={{ marginBottom: 12 }}>
        <div className="ig-row">
          <span className="ig-row-label">Status</span>
          <Tag color={status?.connected ? "success" : "danger"} fill="outline">{status?.connected ? "Connected" : "Offline"}</Tag>
        </div>
        {status?.botName && (
          <div className="ig-row">
            <span className="ig-row-label">Bot</span>
            <span className="ig-row-value">{status.botName}</span>
          </div>
        )}
        <div className="ig-row">
          <span className="ig-row-label">Chat ID</span>
          <span className="ig-row-value">{status?.chatId || "Not set"}</span>
        </div>
        <div className="ig-row">
          <span className="ig-row-label">Mode</span>
          <span className="ig-row-value" style={{ textTransform: "capitalize" }}>{status?.mode}</span>
        </div>
      </Card>
      <Card title="Activity" style={{ marginBottom: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {statItems.map((s) => (
            <div key={s.label} className="ig-stat-box">
              <div className="ig-stat-value">{s.value}</div>
              <div className="ig-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="About">
        <p className="ig-caption" style={{ textAlign: "left", margin: 0 }}>AI-Telegram-Assistant — plan your day, get reminders, and chat with AI via Telegram.</p>
      </Card>
    </FixedPageLayout>
  );
}
