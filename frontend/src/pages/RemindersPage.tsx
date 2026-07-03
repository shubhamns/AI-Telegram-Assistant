import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, PullToRefresh, Toast, Dialog } from "antd-mobile";
import { fetchReminders, completeReminder, clearCompletedReminders } from "@/api/reminderApi";
import type { ReminderStatus, Reminder } from "@/types/reminder";
import TaskCard from "@/components/reminders/TaskCard";
import EditReminderSheet from "@/components/reminders/EditReminderSheet";
import FixedPageLayout from "@/components/common/FixedPageLayout";
import LoadingState from "@/components/common/LoadingState";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import IgButton from "@/components/common/IgButton";
import { formatDayLabel } from "@/utils/format";
export default function RemindersPage() {
  const [tab, setTab] = useState("upcoming");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editing, setEditing] = useState<Reminder | null>(null);
  const qc = useQueryClient();
  const statusFilter: ReminderStatus | undefined = tab === "upcoming" ? "pending" : tab === "completed" ? "sent" : undefined;
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["reminders", tab],
    queryFn: () => fetchReminders(statusFilter),
  });
  const complete = useMutation({
    mutationFn: completeReminder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reminders"] });
      Toast.show({ icon: "success", content: "Done!" });
    },
  });
  const clearDone = useMutation({
    mutationFn: (ids?: string[]) => clearCompletedReminders(ids),
    onSuccess: (deleted) => {
      qc.invalidateQueries({ queryKey: ["reminders"] });
      setSelectMode(false);
      setSelectedIds([]);
      Toast.show({ icon: "success", content: `Cleared ${deleted}` });
    },
    onError: (err: Error) => Toast.show({ icon: "fail", content: err.message }),
  });
  const completedItems = useMemo(() => (data || []).filter((r) => r.status === "sent"), [data]);
  const showClearActions = tab === "completed" || (tab === "all" && completedItems.length > 0);
  const clearTargets = tab === "completed" ? (data || []) : completedItems;
  const grouped = (data || []).reduce<Record<string, Reminder[]>>((acc, r) => {
    const key = formatDayLabel(r.scheduledAt);
    if (!acc[key]) acc[key] = [];
    acc[key]!.push(r);
    return acc;
  }, {});
  const handleTabChange = (key: string) => {
    setTab(key);
    setSelectMode(false);
    setSelectedIds([]);
  };
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const selectAll = () => setSelectedIds(clearTargets.map((r) => r._id));
  const handleClearAll = async () => {
    const ok = await Dialog.confirm({ title: "Clear all?", content: `Delete ${clearTargets.length} completed tasks?`, confirmText: "Clear", cancelText: "Cancel" });
    if (ok) clearDone.mutate(undefined);
  };
  const handleClearSelected = async () => {
    if (!selectedIds.length) return;
    const ok = await Dialog.confirm({ title: "Clear selected?", content: `Delete ${selectedIds.length} tasks?`, confirmText: "Clear", cancelText: "Cancel" });
    if (ok) clearDone.mutate(selectedIds);
  };
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;
  return (
    <>
      <FixedPageLayout
        header={<h2 className="greeting-name" style={{ margin: 0 }}>Reminders</h2>}
        subHeader={
          <>
            <Tabs activeKey={tab} onChange={handleTabChange}>
              <Tabs.Tab title="Upcoming" key="upcoming" />
              <Tabs.Tab title="Completed" key="completed" />
              <Tabs.Tab title="All" key="all" />
            </Tabs>
            {showClearActions && clearTargets.length > 0 && (
              <div className="clear-toolbar">
                {!selectMode ? (
                  <>
                    <IgButton variant="outline" className="ig-btn--sm" onClick={() => setSelectMode(true)}>Select</IgButton>
                    <IgButton variant="danger" className="ig-btn--sm" onClick={handleClearAll} loading={clearDone.isPending}>Clear All ({clearTargets.length})</IgButton>
                  </>
                ) : (
                  <>
                    <IgButton variant="outline" className="ig-btn--sm" onClick={selectAll}>Select All</IgButton>
                    <IgButton variant="outline" className="ig-btn--sm" onClick={() => { setSelectMode(false); setSelectedIds([]); }}>Cancel</IgButton>
                  </>
                )}
              </div>
            )}
          </>
        }
      >
        <PullToRefresh onRefresh={refetch}>
          {Object.keys(grouped).length === 0 ? (
            <EmptyState message="No reminders" />
          ) : (
            Object.entries(grouped).map(([day, items]) => (
              <div key={day} style={{ marginBottom: 16 }}>
                <div className="section-label-text" style={{ marginBottom: 8, paddingLeft: 2 }}>{day}</div>
                <div style={{ background: "var(--ig-surface)", borderRadius: 12, border: "1px solid var(--ig-border)", overflow: "hidden" }}>
                  {(items || []).map((r) => {
                    const isCompleted = r.status === "sent";
                    const canSelect = selectMode && isCompleted && (tab === "completed" || tab === "all");
                    return (
                      <div key={r._id} style={{ padding: "0 14px" }}>
                        <TaskCard
                          reminder={r}
                          done={isCompleted}
                          onToggle={r.status === "pending" ? () => complete.mutate(r._id) : undefined}
                          onEdit={r.status === "pending" && !selectMode ? () => setEditing(r) : undefined}
                          selectMode={canSelect}
                          selected={selectedIds.includes(r._id)}
                          onSelect={() => toggleSelect(r._id)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </PullToRefresh>
      </FixedPageLayout>
      {selectMode && selectedIds.length > 0 && (
        <div className="clear-bar-fixed">
          <IgButton variant="outline" block onClick={() => { setSelectMode(false); setSelectedIds([]); }} style={{ color: "#fff", borderColor: "rgba(255,255,255,0.35)", background: "transparent" }}>Cancel</IgButton>
          <IgButton variant="danger" block loading={clearDone.isPending} onClick={handleClearSelected} style={{ background: "#ED4956", color: "#fff", borderColor: "#ED4956" }}>Clear ({selectedIds.length})</IgButton>
        </div>
      )}
      <EditReminderSheet reminder={editing} onClose={() => setEditing(null)} />
    </>
  );
}
