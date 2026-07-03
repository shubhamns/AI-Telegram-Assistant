import { DotLoading } from "antd-mobile";
export default function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48, color: "var(--ig-text-secondary)" }}>
      <DotLoading color="primary" />
      <span style={{ marginTop: 12, fontSize: 14, fontWeight: 500 }}>{message}</span>
    </div>
  );
}
