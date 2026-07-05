import { useMutation } from "@tanstack/react-query";
import { Toast } from "antd-mobile";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { resendVerification } from "@/api/authApi";
import IgButton from "@/components/common/IgButton";
export default function CheckEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email;
  const resend = useMutation({
    mutationFn: () => resendVerification(email!),
    onSuccess: () => Toast.show({ icon: "success", content: "Verification email sent" }),
    onError: (err: Error) => Toast.show({ icon: "fail", content: err.message }),
  });
  if (!email) return <Navigate to="/register" replace />;
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Verify your email</h1>
        <p className="auth-subtitle">We sent a link to <strong>{email}</strong>. Verify your email, then sign in.</p>
        <IgButton variant="primary" block size="large" loading={resend.isPending} onClick={() => resend.mutate()} style={{ marginBottom: 10 }}>Resend email</IgButton>
        <IgButton variant="outline" block onClick={() => navigate("/login")}>Go to sign in</IgButton>
        <p className="auth-links"><Link to="/register">Back to sign up</Link></p>
      </div>
    </div>
  );
}
