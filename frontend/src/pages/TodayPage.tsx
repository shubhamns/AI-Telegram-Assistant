import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PullToRefresh, Toast } from "antd-mobile";
import { AddOutline, MessageOutline, StarOutline } from "antd-mobile-icons";
import { fetchReminders, completeReminder } from "@/api/reminderApi";
import { fetchTelegramStatus } from "@/api/telegramApi";
import type { Reminder } from "@/types/reminder";
import EditReminderSheet from "@/components/reminders/EditReminderSheet";
import TaskList from "@/components/reminders/TaskList";
import FixedPageLayout from "@/components/common/FixedPageLayout";
import LoadingState from "@/components/common/LoadingState";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import IgButton from "@/components/common/IgButton";
import { getGreeting, isSameDay, isOverdue } from "@/utils/format";
function sortByTime(list: Reminder[]) {
  return [...list].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
}
function getTodayTasks(pending: Reminder[], done: Reminder[], now: Date) {
  const stillDue = pending.filter((r) => isSameDay(r.scheduledAt, now) && !isOverdue(r.scheduledAt, now));
  const finished = done.filter((r) => isSameDay(r.scheduledAt, now));
  return sortByTime([...stillDue, ...finished]);
}
export default function TodayPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Reminder | null>(null);
  const now = new Date();
  const statusQ = useQuery({ queryKey: ["telegram-status"], queryFn: fetchTelegramStatus });
  const pendingQ = useQuery({ queryKey: ["reminders", "pending"], queryFn: () => fetchReminders("pending") });
  const sentQ = useQuery({ queryKey: ["reminders", "sent"], queryFn: () => fetchReminders("sent") });
  const complete = useMutation({
    mutationFn: completeReminder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reminders"] });
      Toast.show({ icon: "success", content: "Done!" });
    },
    onError: (err: Error) => Toast.show({ icon: "fail", content: err.message }),
  });
  if (pendingQ.isLoading || sentQ.isLoading || statusQ.isLoading) return <LoadingState />;
  if (pendingQ.error || sentQ.error) return <ErrorState message={((pendingQ.error || sentQ.error) as Error).message} />;
  const pending = pendingQ.data ?? [];
  const sent = sentQ.data ?? [];
  const overdue = sortByTime(pending.filter((r) => isOverdue(r.scheduledAt, now)));
  const todayItems = getTodayTasks(pending, sent, now);
  const todayPending = pending.filter((r) => isSameDay(r.scheduledAt, now));
  const todayDone = sent.filter((r) => isSameDay(r.scheduledAt, now));
  const total = todayPending.length + todayDone.length;
  const progress = total ? Math.round((todayDone.length / total) * 100) : 0;
  const name = statusQ.data?.userDisplayName || "there";
  const dateLabel = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
  return (
    <>
      <FixedPageLayout
        header={
          <>
            <p className="greeting-text">{getGreeting()}, {name} 👋</p>
            <h2 className="greeting-name">{dateLabel}</h2>
            {total > 0 && (
              <div className="today-progress">
                <div className="today-progress-bar">
                  <div className="today-progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <p className="today-progress-label">{todayDone.length} of {total} done today · {todayPending.length} left</p>
              </div>
            )}
            <div className="ig-quick-actions">
              <button type="button" className="ig-quick-action" onClick={() => navigate("/add")}>
                <div className="ig-story-ring"><div className="ig-story-ring-inner"><AddOutline fontSize={22} color="#F27A30" /></div></div>
                <span>Add</span>
              </button>
              <button type="button" className="ig-quick-action" onClick={() => navigate("/brain-dump")}>
                <div className="ig-story-ring"><div className="ig-story-ring-inner"><StarOutline fontSize={22} color="#F27A30" /></div></div>
                <span>Plan</span>
              </button>
              <button type="button" className="ig-quick-action" onClick={() => navigate("/ai")}>
                <div className="ig-story-ring"><div className="ig-story-ring-inner"><MessageOutline fontSize={22} color="#F27A30" /></div></div>
                <span>AI Chat</span>
              </button>
              <button type="button" className="ig-quick-action" onClick={() => navigate("/send")}>
                <div className="ig-story-ring"><div className="ig-story-ring-inner">📤</div></div>
                <span>Send</span>
              </button>
            </div>
          </>
        }
        subHeader={
          <div className="section-label">
            <span className="section-label-text">Today</span>
            <button type="button" className="ig-btn ig-btn--text" style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => navigate("/reminders")}>See all</button>
          </div>
        }
      >
        <PullToRefresh onRefresh={() => Promise.all([pendingQ.refetch(), sentQ.refetch(), statusQ.refetch()])}>
          {overdue.length > 0 && (
            <div className="overdue-section" style={{ marginBottom: 16 }}>
              <div className="section-label-text overdue-label" style={{ marginBottom: 8, paddingLeft: 2 }}>Overdue ({overdue.length})</div>
              <TaskList items={overdue} onComplete={(id) => complete.mutate(id)} onEdit={setEditing} showOverdue />
            </div>
          )}
          {todayItems.length === 0 && overdue.length === 0 ? (
            <EmptyState message="No tasks for today">
              <IgButton variant="primary" className="ig-btn--sm" onClick={() => navigate("/add")} style={{ marginTop: 12 }}>Add Reminder</IgButton>
            </EmptyState>
          ) : todayItems.length > 0 ? (
            <TaskList items={todayItems} onComplete={(id) => complete.mutate(id)} onEdit={setEditing} />
          ) : null}
        </PullToRefresh>
      </FixedPageLayout>
      <EditReminderSheet reminder={editing} onClose={() => setEditing(null)} />
    </>
  );
}
