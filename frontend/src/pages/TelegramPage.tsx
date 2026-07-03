import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchTelegramStatus, sendTelegramMessage } from "@/api/telegramApi";
import LoadingState from "@/components/common/LoadingState";
import ErrorState from "@/components/common/ErrorState";
export default function TelegramPage() {
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const statusQuery = useQuery({ queryKey: ["telegram-status"], queryFn: fetchTelegramStatus });
  const sendMutation = useMutation({
    mutationFn: sendTelegramMessage,
    onSuccess: () => {
      setFeedback({ type: "success", text: "Message sent successfully!" });
      setMessage("");
    },
    onError: (err: Error) => setFeedback({ type: "error", text: err.message }),
  });
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setFeedback(null);
    sendMutation.mutate(message);
  };
  if (statusQuery.isLoading) return <LoadingState />;
  if (statusQuery.error) return <ErrorState message={statusQuery.error.message} />;
  const status = statusQuery.data;
  return (
    <div className="space-y-4 max-w-xl">
      <h2 className="text-2xl font-bold">Telegram</h2>
      <div className="bg-white rounded-lg border p-4 space-y-2">
        <p><span className="text-slate-500">Status:</span> {status?.connected ? <span className="text-green-600">Connected</span> : <span className="text-red-600">Disconnected</span>}</p>
        {status?.botName && <p><span className="text-slate-500">Bot:</span> {status.botName} {status.botUsername && `(@${status.botUsername})`}</p>}
        <p><span className="text-slate-500">Chat ID:</span> {status?.chatId || "Not configured"}</p>
        <p><span className="text-slate-500">Mode:</span> {status?.mode}</p>
      </div>
      <form onSubmit={handleSend} className="bg-white rounded-lg border p-4 space-y-3">
        <label className="block">
          <span className="text-sm text-slate-600">Send Message</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="Hello from dashboard"
            required
          />
        </label>
        <button type="submit" disabled={sendMutation.isPending} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          Send to Telegram
        </button>
        {feedback && (
          <p className={feedback.type === "success" ? "text-green-600" : "text-red-600"} role="status">
            {feedback.text}
          </p>
        )}
      </form>
    </div>
  );
}
