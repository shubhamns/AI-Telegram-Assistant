import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Toast } from "antd-mobile";
import { register as registerApi } from "@/api/authApi";
import IgButton from "@/components/common/IgButton";
export default function RegisterPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const onFinish = async (values: { name: string; email: string; password: string }) => {
    setLoading(true);
    try {
      await registerApi(values);
      navigate("/check-email", { replace: true, state: { email: values.email } });
    } catch (err) {
      Toast.show({ icon: "fail", content: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Start planning with AI + Telegram</p>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input placeholder="Your name" /></Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true }]}><Input placeholder="you@email.com" type="email" /></Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}><Input placeholder="Min 8 characters" type="password" /></Form.Item>
        </Form>
        <IgButton variant="primary" block size="large" loading={loading} onClick={() => form.submit()} style={{ marginTop: 12 }}>Sign Up</IgButton>
        <p className="auth-links">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
