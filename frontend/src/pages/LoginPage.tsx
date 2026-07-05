import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Toast } from "antd-mobile";
import { useAuth } from "@/context/AuthContext";
import IgButton from "@/components/common/IgButton";
export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    form.setFields([{ name: "email", errors: [] }, { name: "password", errors: [] }]);
    try {
      await login(values.email, values.password);
      navigate("/");
    } catch (err) {
      const e = err as Error & { fields?: Record<string, string> };
      if (e.fields) {
        form.setFields([
          { name: "email", errors: e.fields.email ? [e.fields.email] : [] },
          { name: "password", errors: e.fields.password ? [e.fields.password] : [] },
        ]);
      } else {
        Toast.show({ icon: "fail", content: e.message });
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your assistant</p>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="email" label="Email" rules={[{ required: true }]}><Input placeholder="you@email.com" type="email" /></Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}><Input placeholder="Password" type="password" /></Form.Item>
        </Form>
        <IgButton variant="primary" block size="large" loading={loading} onClick={() => form.submit()} style={{ marginTop: 12 }}>Sign In</IgButton>
        <p className="auth-links"><Link to="/forgot-password">Forgot password?</Link></p>
        <p className="auth-links">No account? <Link to="/register">Sign up</Link></p>
      </div>
    </div>
  );
}
