import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Form, Input, Toast } from "antd-mobile";
import { resetPassword } from "@/api/authApi";
import IgButton from "@/components/common/IgButton";
export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const token = params.get("token") || "";
  const [loading, setLoading] = useState(false);
  const onFinish = async (values: { password: string; confirmPassword: string }) => {
    if (!token) {
      Toast.show({ icon: "fail", content: "Invalid reset link" });
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, values.password);
      Toast.show({ icon: "success", content: "Password updated" });
      navigate("/login");
    } catch (err) {
      Toast.show({ icon: "fail", content: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Reset password</h1>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="password" label="New password" rules={[{ required: true, min: 8, message: "Min 8 characters" }]}><Input placeholder="Min 8 characters" type="password" /></Form.Item>
          <Form.Item name="confirmPassword" label="Confirm password" dependencies={["password"]} rules={[{ required: true, message: "Confirm your password" }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue("password") === value) return Promise.resolve(); return Promise.reject(new Error("Passwords do not match")); } })]}><Input placeholder="Re-enter password" type="password" /></Form.Item>
        </Form>
        <IgButton variant="primary" block size="large" loading={loading} onClick={() => form.submit()} style={{ marginTop: 12 }}>Update Password</IgButton>
        <p className="auth-links"><Link to="/login">Back to sign in</Link></p>
      </div>
    </div>
  );
}
