import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SafeArea } from "antd-mobile";
import { Outlet } from "react-router-dom";
import { scaleTap } from "@/utils/motion";
import {
  AppOutline,
  MessageOutline,
  AddOutline,
  UnorderedListOutline,
  UserOutline,
  SendOutline,
} from "antd-mobile-icons";
const tabs = [
  { key: "/", icon: AppOutline, label: "Today" },
  { key: "/ai", icon: MessageOutline, label: "AI" },
  { key: "/add", icon: AddOutline, label: "Add", center: true },
  { key: "/reminders", icon: UnorderedListOutline, label: "Reminders" },
  { key: "/settings", icon: UserOutline, label: "Profile" },
];
export default function MobileLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const hideChrome = ["/add", "/brain-dump", "/send"].includes(location.pathname);
  const activeKey = tabs.find((t) => t.key === location.pathname)?.key ?? "/";
  return (
    <div className="app-shell">
      <SafeArea position="top" />
      {!hideChrome && (
        <header className="ig-top-bar">
          <h1 className="ig-logo">AI-Telegram-Assistant</h1>
          <button type="button" className="ig-top-action" onClick={() => navigate("/send")} aria-label="Send message">
            <SendOutline fontSize={22} />
          </button>
        </header>
      )}
      <div className={`app-main${hideChrome ? "" : " app-main--tabbar"}`}>
        <div className="page-transition">
          <Outlet />
        </div>
      </div>
      {!hideChrome && (
        <nav className="ig-nav-float" aria-label="Main navigation">
          <SafeArea position="bottom" />
          <div className="ig-nav-pill">
            {tabs.map((item) => {
              const active = activeKey === item.key;
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.key}
                  type="button"
                  className={`ig-nav-item${active ? " ig-nav-item--active" : ""}${item.center ? " ig-nav-item--center" : ""}`}
                  onClick={() => navigate(item.key)}
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                  {...scaleTap}
                  animate={active ? { scale: 1.05 } : { scale: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  {item.center ? (
                    <span className="ig-nav-add"><AddOutline fontSize={26} /></span>
                  ) : (
                    <Icon fontSize={24} />
                  )}
                </motion.button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
