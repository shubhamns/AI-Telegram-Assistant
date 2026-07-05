import { useState } from "react";
import { Link } from "react-router-dom";
import { Form, Input, Toast } from "antd-mobile";
import { forgotPassword } from "@/api/authApi";
import IgButton from "@/components/common/IgButton";
export default function ForgotPasswordPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    try {
      await forgotPassword(values.email);
      setSent(true);
      Toast.show({ icon: "success", content: "Reset link sent if account exists" });
    } catch (err) {
      Toast.show({ icon: "fail", content: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Forgot password</h1>
        <p className="auth-subtitle">{sent ? "Check your email for a reset link." : "We'll email you a reset link"}</p>
        {!sent && (
          <>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item name="email" label="Email" rules={[{ required: true }]}><Input placeholder="you@email.com" type="email" /></Form.Item>
            </Form>
            <IgButton variant="primary" block size="large" loading={loading} onClick={() => form.submit()} style={{ marginTop: 12 }}>Send Reset Link</IgButton>
          </>
        )}
        <p className="auth-links"><Link to="/login">Back to sign in</Link></p>
      </div>
    </div>
  );
}
