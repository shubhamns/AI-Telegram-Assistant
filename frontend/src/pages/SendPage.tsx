import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { TextArea, Toast, NavBar } from "antd-mobile";
import { SendOutline } from "antd-mobile-icons";
import { sendTelegramMessage } from "@/api/telegramApi";
import IgButton from "@/components/common/IgButton";
export default function SendPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const mutation = useMutation({
    mutationFn: sendTelegramMessage,
    onSuccess: () => {
      Toast.show({ icon: "success", content: "Sent!" });
      setMessage("");
    },
    onError: (err: Error) => Toast.show({ icon: "fail", content: err.message }),
  });
  return (
    <div className="page-stack">
      <div className="page-stack-header">
        <NavBar onBack={() => navigate("/")}>New message</NavBar>
      </div>
      <div className="page-stack-body">
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <div className="ig-hero-icon">
            <div className="ig-hero-icon-inner"><SendOutline fontSize={36} color="#F27A30" /></div>
          </div>
          <p className="ig-caption">Send a note directly to your Telegram</p>
        </div>
        <TextArea placeholder="Write a message..." value={message} onChange={(val) => setMessage(val.slice(0, 200))} rows={5} showCount maxLength={200} />
      </div>
      <div className="page-stack-footer">
        <IgButton variant="primary" block size="large" loading={mutation.isPending} disabled={!message.trim()} onClick={() => mutation.mutate(message)}>
          Send
        </IgButton>
      </div>
    </div>
  );
}
