import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Toast, NavBar } from "antd-mobile";
import { createReminder } from "@/api/reminderApi";
import IgButton from "@/components/common/IgButton";
import ReminderFormFields from "@/components/reminders/ReminderFormFields";
import { notifyToMinutes } from "@/utils/notify";
import { defaultTime, scheduledAtIso } from "@/utils/time";
export default function AddReminderPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form] = Form.useForm();
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(defaultTime);
  const [notify, setNotify] = useState("At time");
  const save = useMutation({
    mutationFn: createReminder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reminders"] });
      Toast.show({ icon: "success", content: "Reminder saved" });
      navigate("/");
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
  return (
    <div className="page-stack">
      <div className="page-stack-header">
        <NavBar onBack={() => navigate("/")} right={<button type="button" className="ig-nav-action" onClick={() => form.submit()}>Done</button>}>
          New Reminder
        </NavBar>
      </div>
      <div className="page-stack-body">
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <ReminderFormFields date={date} onDateChange={setDate} time={time} onTimeChange={setTime} notify={notify} onNotifyChange={setNotify} />
        </Form>
      </div>
      <div className="page-stack-footer">
        <IgButton variant="primary" block size="large" loading={save.isPending} onClick={() => form.submit()}>Save Reminder</IgButton>
      </div>
    </div>
  );
}
