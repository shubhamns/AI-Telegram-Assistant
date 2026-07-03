import TaskCard from "@/components/reminders/TaskCard";
import type { Reminder } from "@/types/reminder";
type Props = {
  items: Reminder[];
  onComplete: (id: string) => void;
  onEdit?: (item: Reminder) => void;
  showOverdue?: boolean;
};
export default function TaskList({ items, onComplete, onEdit, showOverdue }: Props) {
  return (
    <div className="task-list-card">
      {items.map((item) => (
        <div key={item._id} className="task-list-item">
          <TaskCard
            reminder={item}
            done={item.status === "sent"}
            overdue={showOverdue}
            onToggle={item.status === "pending" ? () => onComplete(item._id) : undefined}
            onEdit={item.status === "pending" && onEdit ? () => onEdit(item) : undefined}
          />
        </div>
      ))}
    </div>
  );
}
