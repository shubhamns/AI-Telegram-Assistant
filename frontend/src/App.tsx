import { Routes, Route } from "react-router-dom";
import MobileLayout from "@/layouts/MobileLayout";
import TodayPage from "@/pages/TodayPage";
import AIPage from "@/pages/AIPage";
import AddReminderPage from "@/pages/AddReminderPage";
import SendPage from "@/pages/SendPage";
import BrainDumpPage from "@/pages/BrainDumpPage";
import RemindersPage from "@/pages/RemindersPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFoundPage from "@/pages/NotFoundPage";
export default function App() {
  return (
    <Routes>
      <Route element={<MobileLayout />}>
        <Route index element={<TodayPage />} />
        <Route path="ai" element={<AIPage />} />
        <Route path="add" element={<AddReminderPage />} />
        <Route path="send" element={<SendPage />} />
        <Route path="brain-dump" element={<BrainDumpPage />} />
        <Route path="reminders" element={<RemindersPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
