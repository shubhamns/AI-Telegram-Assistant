import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/utils/format";
const navItems = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/conversations", label: "Conversations" },
  { to: "/reminders", label: "Reminders" },
  { to: "/telegram", label: "Telegram" },
];
export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="bg-slate-900 text-white md:w-64 md:min-h-screen">
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-lg font-semibold">AI-Telegram-Assistant</h1>
          <p className="text-xs text-slate-400 mt-1">Automation Dashboard</p>
        </div>
        <nav className="p-2 flex md:flex-col gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn("px-3 py-2 rounded text-sm whitespace-nowrap", isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-4 md:p-6 max-w-6xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
