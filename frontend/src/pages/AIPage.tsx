import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input, DotLoading } from "antd-mobile";
import { fetchConversations, fetchMessages } from "@/api/conversationApi";
import { sendAiChat } from "@/api/aiApi";
import LoadingState from "@/components/common/LoadingState";
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
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMsgs, msgQuery.data]);
  const history: ChatMsg[] = (msgQuery.data || [])
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
  if (convQuery.isLoading) return <LoadingState />;
  return (
    <div className="chat-page">
      <div className="chat-header">
        <div className="chat-avatar"><div className="chat-avatar-inner">🤖</div></div>
        <div>
          <h1 className="chat-title">AI Assistant</h1>
          <p className="chat-subtitle">Active now</p>
        </div>
      </div>
      <div className="chat-messages">
        {allMsgs.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
            <p style={{ color: "#8E8E8E", fontSize: 14 }}>Send a message to start chatting</p>
          </div>
        )}
        {allMsgs.map((m, i) => (
          <div key={i} className={`chat-bubble chat-bubble--${m.role}`}>{m.content}</div>
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
