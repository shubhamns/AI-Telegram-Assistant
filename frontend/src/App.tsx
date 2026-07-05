import { Routes, Route } from "react-router-dom";
import { ProtectedRoute, GuestRoute } from "@/components/auth/AuthRoutes";
import MobileLayout from "@/layouts/MobileLayout";
import TodayPage from "@/pages/TodayPage";
import AIPage from "@/pages/AIPage";
import AddReminderPage from "@/pages/AddReminderPage";
import SendPage from "@/pages/SendPage";
import BrainDumpPage from "@/pages/BrainDumpPage";
import RemindersPage from "@/pages/RemindersPage";
import SettingsPage from "@/pages/SettingsPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import VerifyEmailPage from "@/pages/VerifyEmailPage";
import CheckEmailPage from "@/pages/CheckEmailPage";
import NotFoundPage from "@/pages/NotFoundPage";
export default function App() {
  return (
    <Routes>
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/check-email" element={<CheckEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<MobileLayout />}>
          <Route index element={<TodayPage />} />
          <Route path="ai" element={<AIPage />} />
          <Route path="add" element={<AddReminderPage />} />
          <Route path="send" element={<SendPage />} />
          <Route path="brain-dump" element={<BrainDumpPage />} />
          <Route path="reminders" element={<RemindersPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
