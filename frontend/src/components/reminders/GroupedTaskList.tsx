import TaskCard from "@/components/reminders/TaskCard";
import type { Reminder } from "@/types/reminder";
type Props = {
  groups: Record<string, Reminder[]>;
  tab: string;
  selectMode: boolean;
  selectedIds: string[];
  onComplete: (id: string) => void;
  onEdit: (item: Reminder) => void;
  onToggleSelect: (id: string) => void;
};
export default function GroupedTaskList({ groups, tab, selectMode, selectedIds, onComplete, onEdit, onToggleSelect }: Props) {
  return (
    <>
      {Object.entries(groups).map(([day, items]) => (
        <div key={day} style={{ marginBottom: 16 }}>
          <div className="section-label-text" style={{ marginBottom: 8, paddingLeft: 2 }}>{day}</div>
          <div style={{ background: "var(--ig-surface)", borderRadius: 12, border: "1px solid var(--ig-border)", overflow: "hidden" }}>
            {items.map((r) => {
              const isCompleted = r.status === "sent";
              const canSelect = selectMode && isCompleted && (tab === "completed" || tab === "all");
              return (
                <div key={r._id} style={{ padding: "0 14px" }}>
                  <TaskCard
                    reminder={r}
                    done={isCompleted}
                    onToggle={r.status === "pending" ? () => onComplete(r._id) : undefined}
                    onEdit={r.status === "pending" && !selectMode ? () => onEdit(r) : undefined}
                    selectMode={canSelect}
                    selected={selectedIds.includes(r._id)}
                    onSelect={() => onToggleSelect(r._id)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
