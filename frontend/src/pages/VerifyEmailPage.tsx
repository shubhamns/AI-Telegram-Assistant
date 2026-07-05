import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Toast } from "antd-mobile";
import { verifyEmail } from "@/api/authApi";
import IgButton from "@/components/common/IgButton";
import LoadingState from "@/components/common/LoadingState";
export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "ok" | "fail">("loading");
  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setStatus("fail");
      return;
    }
    verifyEmail(token)
      .then(() => {
        setStatus("ok");
        Toast.show({ icon: "success", content: "Email verified! You can sign in now." });
      })
      .catch(() => setStatus("fail"));
  }, [params]);
  if (status === "loading") return <LoadingState message="Verifying email..." />;
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">{status === "ok" ? "Email verified" : "Verification failed"}</h1>
        <p className="auth-subtitle">{status === "ok" ? "Your account is ready. Sign in to continue." : "The link is invalid or expired."}</p>
        <IgButton variant="primary" block onClick={() => navigate(status === "ok" ? "/login" : "/register")}>{status === "ok" ? "Sign in" : "Sign up again"}</IgButton>
        {status === "fail" && <p className="auth-links"><Link to="/login">Sign in</Link></p>}
      </div>
    </div>
  );
}
