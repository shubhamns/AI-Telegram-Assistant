import { NavBar } from "antd-mobile";
import { useNavigate } from "react-router-dom";
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  action?: React.ReactNode;
}
export default function PageHeader({ title, subtitle, backTo = "/", action }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <div style={{ margin: "0 -12px 12px" }}>
      <NavBar onBack={() => navigate(backTo)} right={action}>
        {title}
      </NavBar>
      {subtitle && <p style={{ margin: "4px 16px 0", fontSize: 13, color: "#999" }}>{subtitle}</p>}
    </div>
  );
}
