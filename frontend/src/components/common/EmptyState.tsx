import { Empty } from "antd-mobile";
import type { ReactNode } from "react";
export default function EmptyState({ message, children }: { message: string; children?: ReactNode }) {
  return (
    <div style={{ padding: "32px 0", textAlign: "center" }}>
      <Empty description={message} />
      {children}
    </div>
  );
}
