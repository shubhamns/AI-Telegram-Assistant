import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchConversations, fetchMessages } from "@/api/conversationApi";
import LoadingState from "@/components/common/LoadingState";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import { formatDate } from "@/utils/format";
export default function ConversationsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const conversationsQuery = useQuery({ queryKey: ["conversations"], queryFn: fetchConversations });
  const messagesQuery = useQuery({
    queryKey: ["messages", selectedId],
    queryFn: () => fetchMessages(selectedId!),
    enabled: !!selectedId,
  });
  if (conversationsQuery.isLoading) return <LoadingState />;
  if (conversationsQuery.error) return <ErrorState message={conversationsQuery.error.message} />;
  const conversations = conversationsQuery.data || [];
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Conversations</h2>
      {conversations.length === 0 ? (
        <EmptyState message="No Telegram conversations yet. Send a message to your bot." />
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          <ul className="md:col-span-1 bg-white rounded-lg border divide-y max-h-[70vh] overflow-y-auto">
            {conversations.map((c) => (
              <li key={c._id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(c._id)}
                  className={`w-full text-left p-3 hover:bg-slate-50 ${selectedId === c._id ? "bg-blue-50" : ""}`}
                >
                  <p className="font-medium">{c.firstName || c.telegramUsername || "User"}</p>
                  <p className="text-xs text-slate-500">Chat: {c.telegramChatId}</p>
                </button>
              </li>
            ))}
          </ul>
          <div className="md:col-span-2 bg-white rounded-lg border p-4 min-h-[300px]">
            {!selectedId ? (
              <p className="text-slate-500">Select a conversation</p>
            ) : messagesQuery.isLoading ? (
              <LoadingState message="Loading messages..." />
            ) : messagesQuery.error ? (
              <ErrorState message={messagesQuery.error.message} />
            ) : (messagesQuery.data || []).length === 0 ? (
              <EmptyState message="No messages in this conversation" />
            ) : (
              <ul className="space-y-3">
                {(messagesQuery.data || []).map((m) => (
                  <li key={m._id} className={`p-3 rounded-lg ${m.role === "user" ? "bg-slate-100 ml-0 mr-8" : "bg-blue-50 ml-8 mr-0"}`}>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span className="capitalize">{m.role}</span>
                      <span>{formatDate(m.createdAt)}</span>
                    </div>
                    <p className="text-sm">{m.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
