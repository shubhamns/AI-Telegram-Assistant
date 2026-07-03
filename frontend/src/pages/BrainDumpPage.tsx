import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TextArea, Card, Tag, Toast, NavBar } from "antd-mobile";
import { generatePlan } from "@/api/aiApi";
import { createReminder } from "@/api/reminderApi";
import IgButton from "@/components/common/IgButton";
interface SuggestedTask {
  title: string;
  time: string;
}
export default function BrainDumpPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [tasks, setTasks] = useState<SuggestedTask[]>([]);
  const planMutation = useMutation({
    mutationFn: generatePlan,
    onSuccess: (result) => setTasks(result),
    onError: (err: Error) => Toast.show({ icon: "fail", content: err.message }),
  });
  const addAllMutation = useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      for (const task of tasks) {
        const scheduledAt = new Date(`${today}T${task.time || "09:00"}`).toISOString();
        await createReminder({ title: task.title, scheduledAt, originalText: text });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      Toast.show({ icon: "success", content: "All tasks added!" });
      navigate("/");
    },
    onError: (err: Error) => Toast.show({ icon: "fail", content: err.message }),
  });
  return (
    <div className="page-stack">
      <div className="page-stack-header">
        <NavBar onBack={() => navigate("/")}>Brain Dump</NavBar>
      </div>
      <div className="page-stack-body">
        <p className="ig-caption" style={{ textAlign: "left", marginBottom: 12 }}>Type your thoughts — AI turns them into a plan</p>
        <TextArea placeholder="Today learn FastAPI... call recruiter at 4..." value={text} onChange={setText} rows={6} style={{ marginBottom: 16 }} />
        <IgButton variant="primary" block size="large" loading={planMutation.isPending} disabled={!text.trim()} onClick={() => planMutation.mutate(text)} style={{ marginBottom: 20 }}>
          Generate Plan ✨
        </IgButton>
        {tasks.length > 0 && (
          <>
            <div className="section-label-text" style={{ marginBottom: 12 }}>Suggested plan</div>
            {tasks.map((t, i) => (
              <Card key={i} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Tag color="primary" fill="outline">{t.time}</Tag>
                  <span style={{ fontWeight: 500, fontSize: 14 }}>{t.title}</span>
                </div>
              </Card>
            ))}
          </>
        )}
      </div>
      {tasks.length > 0 && (
        <div className="page-stack-footer">
          <IgButton variant="primary" block size="large" loading={addAllMutation.isPending} onClick={() => addAllMutation.mutate()}>
            Add All to Today
          </IgButton>
        </div>
      )}
    </div>
  );
}
