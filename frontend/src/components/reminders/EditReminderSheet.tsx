import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Popup, Form, Toast, Dialog } from "antd-mobile";
import { updateReminder, deleteReminder } from "@/api/reminderApi";
import type { Reminder } from "@/types/reminder";
import IgButton from "@/components/common/IgButton";
import ReminderFormFields from "@/components/reminders/ReminderFormFields";
import { notifyToMinutes, minutesToNotify } from "@/utils/notify";
import { time12FromDate, scheduledAtIso, type Time12 } from "@/utils/time";
type Props = {
  reminder: Reminder | null;
  onClose: () => void;
};
export default function EditReminderSheet({ reminder, onClose }: Props) {
  const qc = useQueryClient();
  const [form] = Form.useForm();
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState<Time12>(["09", "00", "AM"]);
  const [notify, setNotify] = useState("At time");
  useEffect(() => {
    if (!reminder) return;
    const when = new Date(reminder.scheduledAt);
    setDate(when);
    setTime(time12FromDate(when));
    setNotify(minutesToNotify(reminder.notifyMinutesBefore ?? 0));
    form.setFieldsValue({ title: reminder.title, notes: reminder.originalText || "" });
  }, [reminder, form]);
  const save = useMutation({
    mutationFn: (payload: { title: string; scheduledAt: string; originalText?: string; notifyMinutesBefore: number }) =>
      updateReminder(reminder!._id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reminders"] });
      Toast.show({ icon: "success", content: "Updated" });
      onClose();
    },
    onError: (err: Error) => Toast.show({ icon: "fail", content: err.message }),
  });
  const remove = useMutation({
    mutationFn: () => deleteReminder(reminder!._id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reminders"] });
      Toast.show({ icon: "success", content: "Deleted" });
      onClose();
    },
    onError: (err: Error) => Toast.show({ icon: "fail", content: err.message }),
  });
  const onSubmit = (values: { title: string; notes?: string }) => {
    save.mutate({
      title: values.title,
      scheduledAt: scheduledAtIso(date, time),
      originalText: values.notes || undefined,
      notifyMinutesBefore: notifyToMinutes(notify),
    });
  };
  const onDelete = async () => {
    const ok = await Dialog.confirm({ title: "Delete reminder?", content: "This can't be undone.", confirmText: "Delete", cancelText: "Cancel" });
    if (ok) remove.mutate();
  };
  return (
    <Popup visible={!!reminder} onMaskClick={onClose} onClose={onClose} bodyStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: "85vh", overflow: "auto" }}>
      <div className="edit-sheet">
        <div className="edit-sheet-header">
          <h3 className="edit-sheet-title">Edit Reminder</h3>
          <button type="button" className="ig-nav-action" onClick={() => form.submit()}>Save</button>
        </div>
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <ReminderFormFields date={date} onDateChange={setDate} time={time} onTimeChange={setTime} notify={notify} onNotifyChange={setNotify} />
        </Form>
        <IgButton variant="danger" block className="ig-btn--sm" loading={remove.isPending} onClick={onDelete} style={{ marginTop: 8 }}>Delete Reminder</IgButton>
      </div>
    </Popup>
  );
}
