import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input, DotLoading, Dialog, Toast } from "antd-mobile";
import { fetchConversations, fetchMessages, clearChatHistory } from "@/api/conversationApi";
import { sendAiChat } from "@/api/aiApi";
import LoadingState from "@/components/common/LoadingState";
import { EMPTY_MESSAGES } from "@/utils/empty";
interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}
export default function AIPage() {
  const [input, setInput] = useState("");
  const [localMsgs, setLocalMsgs] = useState<ChatMsg[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const convQuery = useQuery({ queryKey: ["conversations"], queryFn: fetchConversations });
  const convId = convQuery.data?.[0]?._id;
  const msgQuery = useQuery({
    queryKey: ["messages", convId],
    queryFn: () => fetchMessages(convId!),
    enabled: !!convId,
  });
  const chatMutation = useMutation({
    mutationFn: sendAiChat,
    onSuccess: (reply) => {
      setLocalMsgs((prev) => [...prev, { role: "assistant", content: reply }]);
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
  const clearMutation = useMutation({
    mutationFn: () => clearChatHistory(convId!),
    onSuccess: (deleted) => {
      setLocalMsgs([]);
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      Toast.show({ icon: "success", content: deleted ? `Cleared ${deleted} messages` : "Chat cleared" });
    },
    onError: (err: Error) => Toast.show({ icon: "fail", content: err.message }),
  });
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMsgs, msgQuery.data]);
  const history: ChatMsg[] = (msgQuery.data ?? EMPTY_MESSAGES)
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
  const allMsgs = [...history, ...localMsgs.filter((lm) => !history.some((h) => h.content === lm.content && h.role === lm.role))];
  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;
    const msg = input.trim();
    setLocalMsgs((prev) => [...prev, { role: "user", content: msg }]);
    setInput("");
    chatMutation.mutate(msg);
  };
  const handleClearHistory = async () => {
    if (!allMsgs.length) return;
    const ok = await Dialog.confirm({ title: "Clear chat history?", content: "All messages will be deleted. This can't be undone.", confirmText: "Clear", cancelText: "Cancel" });
    if (!ok) return;
    if (convId) clearMutation.mutate();
    else {
      setLocalMsgs([]);
      Toast.show({ icon: "success", content: "Chat cleared" });
    }
  };
  if (convQuery.isLoading) return <LoadingState />;
  return (
    <div className="chat-page">
      <div className="chat-header">
        <div className="chat-avatar"><div className="chat-avatar-inner">🤖</div></div>
        <div style={{ flex: 1 }}>
          <h1 className="chat-title">AI Assistant</h1>
          <p className="chat-subtitle">Active now</p>
        </div>
        <button type="button" className="chat-clear-btn" onClick={handleClearHistory} disabled={!allMsgs.length || clearMutation.isPending}>Clear</button>
      </div>
      <div className="chat-messages">
        {allMsgs.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
            <p style={{ color: "#8E8E8E", fontSize: 14 }}>Send a message to start chatting</p>
          </div>
        )}
        {allMsgs.map((m, i) => (
          <div key={`${m.role}-${i}-${m.content.slice(0, 24)}`} className={`chat-bubble chat-bubble--${m.role}`}>{m.content}</div>
        ))}
        {chatMutation.isPending && (
          <div className="chat-bubble chat-bubble--assistant"><DotLoading color="primary" /></div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input-bar">
        <Input placeholder="Message..." value={input} onChange={setInput} onEnterPress={handleSend} />
        <button type="button" className="chat-send-btn" onClick={handleSend} disabled={chatMutation.isPending || !input.trim()}>Send</button>
      </div>
      {chatMutation.error && <div style={{ color: "#ED4956", fontSize: 12, padding: "4px 16px" }}>{chatMutation.error.message}</div>}
    </div>
  );
}
