import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, PullToRefresh, Dialog } from "antd-mobile";
import { fetchReminders } from "@/api/reminderApi";
import type { ReminderStatus, Reminder } from "@/types/reminder";
import GroupedTaskList from "@/components/reminders/GroupedTaskList";
import EditReminderSheet from "@/components/reminders/EditReminderSheet";
import FixedPageLayout from "@/components/common/FixedPageLayout";
import LoadingState from "@/components/common/LoadingState";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import IgButton from "@/components/common/IgButton";
import { useCompleteReminder } from "@/hooks/useCompleteReminder";
import { useClearCompletedReminders } from "@/hooks/useClearCompletedReminders";
import { EMPTY_REMINDERS } from "@/utils/empty";
import { groupRemindersByDay } from "@/utils/reminders";
export default function RemindersPage() {
  const [tab, setTab] = useState("upcoming");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editing, setEditing] = useState<Reminder | null>(null);
  const resetSelection = () => {
    setSelectMode(false);
    setSelectedIds([]);
  };
  const statusFilter: ReminderStatus | undefined = tab === "upcoming" ? "pending" : tab === "completed" ? "sent" : undefined;
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["reminders", tab],
    queryFn: () => fetchReminders(statusFilter),
  });
  const complete = useCompleteReminder();
  const clearDone = useClearCompletedReminders(resetSelection);
  const reminders = data ?? EMPTY_REMINDERS;
  const completedItems = useMemo(() => reminders.filter((r) => r.status === "sent"), [reminders]);
  const showClearActions = tab === "completed" || (tab === "all" && completedItems.length > 0);
  const clearTargets = tab === "completed" ? reminders : completedItems;
  const grouped = useMemo(() => groupRemindersByDay(reminders), [reminders]);
  const handleTabChange = (key: string) => {
    setTab(key);
    resetSelection();
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
                    <IgButton variant="outline" className="ig-btn--sm" onClick={resetSelection}>Cancel</IgButton>
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
            <GroupedTaskList
              groups={grouped}
              tab={tab}
              selectMode={selectMode}
              selectedIds={selectedIds}
              onComplete={(id) => complete.mutate(id)}
              onEdit={setEditing}
              onToggleSelect={toggleSelect}
            />
          )}
        </PullToRefresh>
      </FixedPageLayout>
      {selectMode && selectedIds.length > 0 && (
        <div className="clear-bar-fixed">
          <IgButton variant="outline" block onClick={resetSelection} style={{ color: "#fff", borderColor: "rgba(255,255,255,0.35)", background: "transparent" }}>Cancel</IgButton>
          <IgButton variant="danger" block loading={clearDone.isPending} onClick={handleClearSelected} style={{ background: "#ED4956", color: "#fff", borderColor: "#ED4956" }}>Clear ({selectedIds.length})</IgButton>
        </div>
      )}
      <EditReminderSheet reminder={editing} onClose={() => setEditing(null)} />
    </>
  );
}
