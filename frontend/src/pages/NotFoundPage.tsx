import { ErrorBlock } from "antd-mobile";
import { useNavigate } from "react-router-dom";
import IgButton from "@/components/common/IgButton";
export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{ paddingTop: 48, background: "var(--ig-bg)", minHeight: "100vh" }}>
      <ErrorBlock status="empty" title="Page not found" description="This page doesn't exist">
        <IgButton variant="primary" onClick={() => navigate("/")}>Back to Home</IgButton>
      </ErrorBlock>
    </div>
  );
}
