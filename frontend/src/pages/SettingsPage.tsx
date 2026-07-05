import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, Tag, List, Toast } from "antd-mobile";
import { RightOutline } from "antd-mobile-icons";
import { useNavigate } from "react-router-dom";
import { fetchTelegramStatus, fetchDashboardStats, fetchTelegramLink } from "@/api/telegramApi";
import { fetchBillingUsage, createCheckout, createPortal } from "@/api/billingApi";
import { useAuth } from "@/context/AuthContext";
import FixedPageLayout from "@/components/common/FixedPageLayout";
import LoadingState from "@/components/common/LoadingState";
import ErrorState from "@/components/common/ErrorState";
import IgButton from "@/components/common/IgButton";
export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, workspace, logout } = useAuth();
  const statusQuery = useQuery({ queryKey: ["telegram-status"], queryFn: fetchTelegramStatus });
  const statsQuery = useQuery({ queryKey: ["dashboard-stats"], queryFn: fetchDashboardStats });
  const usageQuery = useQuery({ queryKey: ["billing-usage"], queryFn: fetchBillingUsage });
  const linkMutation = useMutation({
    mutationFn: fetchTelegramLink,
    onSuccess: (data) => {
      window.open(data.deepLink, "_blank");
      Toast.show({ icon: "success", content: "Open Telegram and tap Start" });
    },
    onError: (err: Error) => Toast.show({ icon: "fail", content: err.message }),
  });
  const checkoutMutation = useMutation({
    mutationFn: createCheckout,
    onSuccess: (data) => { if (data.url) window.location.href = data.url; else Toast.show({ content: "Stripe not configured" }); },
    onError: (err: Error) => Toast.show({ icon: "fail", content: err.message }),
  });
  const portalMutation = useMutation({
    mutationFn: createPortal,
    onSuccess: (data) => { if (data.url) window.location.href = data.url; else Toast.show({ content: "No billing account" }); },
    onError: (err: Error) => Toast.show({ icon: "fail", content: err.message }),
  });
  if (statusQuery.isLoading || statsQuery.isLoading || usageQuery.isLoading) return <LoadingState />;
  if (statusQuery.error || statsQuery.error) return <ErrorState message={(statusQuery.error || statsQuery.error)!.message} />;
  const status = statusQuery.data;
  const stats = statsQuery.data;
  const usage = usageQuery.data || workspace;
  const statItems = [
    { label: "Messages", value: stats?.totalMessages ?? 0 },
    { label: "Pending", value: stats?.pendingReminders ?? 0 },
    { label: "Sent", value: stats?.sentReminders ?? 0 },
    { label: "Chats", value: stats?.totalConversations ?? 0 },
  ];
  return (
    <FixedPageLayout header={<h2 className="greeting-name" style={{ margin: 0 }}>{user?.name || "Profile"}</h2>}>
      <Card title="Account" style={{ marginBottom: 12 }}>
        <div className="ig-row"><span className="ig-row-label">Email</span><span className="ig-row-value">{user?.email}</span></div>
        <div className="ig-row"><span className="ig-row-label">Plan</span><Tag color="primary" fill="outline">{usage?.plan?.toUpperCase()}</Tag></div>
      </Card>
      <List header="Menu" style={{ marginBottom: 12 }}>
        <List.Item prefix="📤" onClick={() => navigate("/send")} arrow={<RightOutline color="#8E8E8E" />}>Send to Telegram</List.Item>
        <List.Item prefix="✨" onClick={() => navigate("/brain-dump")} arrow={<RightOutline color="#8E8E8E" />}>Brain Dump</List.Item>
        <List.Item prefix="💬" onClick={() => navigate("/ai")} arrow={<RightOutline color="#8E8E8E" />}>Messages</List.Item>
        <List.Item prefix="📋" onClick={() => navigate("/reminders")} arrow={<RightOutline color="#8E8E8E" />}>Reminders</List.Item>
      </List>
      <Card title="Telegram" style={{ marginBottom: 12 }}>
        <div className="ig-row">
          <span className="ig-row-label">Status</span>
          <Tag color={status?.telegramLinked ? "success" : "warning"} fill="outline">{status?.telegramLinked ? "Linked" : "Not linked"}</Tag>
        </div>
        {status?.botName && <div className="ig-row"><span className="ig-row-label">Bot</span><span className="ig-row-value">{status.botName}</span></div>}
        <div className="ig-row"><span className="ig-row-label">Chat</span><span className="ig-row-value">{status?.chatId || "Not linked"}</span></div>
        <IgButton variant="primary" block className="ig-btn--sm" style={{ marginTop: 10 }} loading={linkMutation.isPending} onClick={() => linkMutation.mutate()}>{status?.telegramLinked ? "Reconnect Telegram" : "Connect Telegram"}</IgButton>
      </Card>
      <Card title="Usage" style={{ marginBottom: 12 }}>
        <div className="ig-row"><span className="ig-row-label">AI messages</span><span className="ig-row-value">{usage?.usage.aiMessages ?? 0} / {usage?.limits.aiMessages ?? 0}</span></div>
        <div className="ig-row"><span className="ig-row-label">Reminders</span><span className="ig-row-value">{usage?.usage.reminders ?? 0} / {usage?.limits.reminders ?? 0}</span></div>
        <div className="ig-row"><span className="ig-row-label">Brain dumps</span><span className="ig-row-value">{usage?.usage.brainDumps ?? 0} / {usage?.limits.brainDumps ?? 0}</span></div>
        {usage?.plan === "free" ? (
          <IgButton variant="primary" block className="ig-btn--sm" style={{ marginTop: 10 }} loading={checkoutMutation.isPending} onClick={() => checkoutMutation.mutate()}>Upgrade to Pro — $9/mo</IgButton>
        ) : (
          <IgButton variant="outline" block className="ig-btn--sm" style={{ marginTop: 10 }} loading={portalMutation.isPending} onClick={() => portalMutation.mutate()}>Manage billing</IgButton>
        )}
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
      <IgButton variant="danger" block className="ig-btn--sm" onClick={() => { void logout().then(() => navigate("/login")); }}>Sign out</IgButton>
    </FixedPageLayout>
  );
}
