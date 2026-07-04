import { motion } from "framer-motion";
import type { Reminder } from "@/types/reminder";
import { formatTime } from "@/utils/format";
import { scaleTap } from "@/utils/motion";
type Props = {
  reminder: Reminder;
  done?: boolean;
  onToggle?: () => void;
  onEdit?: () => void;
  selectMode?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  overdue?: boolean;
};
export default function TaskCard({ reminder, done, onToggle, onEdit, selectMode, selected, onSelect, overdue }: Props) {
  const handleRowClick = () => {
    if (selectMode) onSelect?.();
    else if (!done && onEdit) onEdit();
  };
  return (
    <motion.div className={`task-card${selectMode && selected ? " task-card--selected" : ""}${overdue ? " task-card--overdue" : ""}`} onClick={handleRowClick} style={selectMode || onEdit ? { cursor: "pointer" } : undefined} {...scaleTap}>
      {selectMode && (
        <div className={`task-select${selected ? " task-select--on" : ""}`} onClick={(e) => { e.stopPropagation(); onSelect?.(); }}>
          {selected && (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      )}
      <div className="task-time-badge">{formatTime(reminder.scheduledAt)}</div>
      <div className="task-content">
        <p className={`task-title${done ? " task-title--done" : ""}`}>{reminder.title}</p>
        {reminder.originalText && <p className="task-subtitle">{reminder.originalText}</p>}
      </div>
      {onToggle && (
        <motion.button type="button" className={`task-check${done ? " task-check--done" : ""}`} onClick={(e) => { e.stopPropagation(); onToggle(); }} aria-label={done ? "Completed" : "Mark complete"} whileTap={{ scale: 0.85 }} animate={done ? { scale: [1, 1.2, 1] } : { scale: 1 }} transition={{ duration: 0.25 }}>
          {done && (
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </motion.button>
      )}
    </motion.div>
  );
}
