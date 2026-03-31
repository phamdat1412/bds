import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../app/AuthContext";
import { loginApi } from "./auth.api";

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, roles, isBootstrapping, setAuthData } = useAuth();

  const [email, setEmail] = useState("admin@sgroup.local");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("12345678");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isBootstrapping) return;

    if (isAuthenticated) {
      if (roles.includes("admin")) {
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      if (roles.includes("seller")) {
        navigate("/seller/dashboard", { replace: true });
        return;
      }

      navigate("/user", { replace: true });
    }
  }, [isAuthenticated, roles, isBootstrapping, navigate]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await loginApi({
        email: email || undefined,
        phone: phone || undefined,
        password,
      });

      const authData = result.data;

      setAuthData(authData);
      navigate(authData.redirectTo, { replace: true });
    } catch (error: any) {
      const apiMessage = error?.response?.data?.message;
      const apiErrors = error?.response?.data?.errors;

      setErrorMessage(
        Array.isArray(apiErrors) && apiErrors.length > 0
          ? apiErrors.join(", ")
          : apiMessage || "Đăng nhập thất bại"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div>
          <h1 style={styles.title}>Đăng nhập</h1>
          <div style={styles.sub}>
            Đăng nhập để vào đúng khu vực theo role
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div style={styles.orText}>hoặc</div>

          <input
            style={styles.input}
            placeholder="Số điện thoại"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {errorMessage ? <div style={styles.error}>{errorMessage}</div> : null}

          <button type="submit" style={styles.primaryBtn} disabled={isLoading}>
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#f3f4f6",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#fff",
    borderRadius: 24,
    padding: 24,
    boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    display: "grid",
    gap: 18,
  },
  title: {
    margin: 0,
    fontSize: 30,
    fontWeight: 800,
    color: "#111827",
  },
  sub: {
    marginTop: 6,
    fontSize: 14,
    color: "#6b7280",
  },
  form: {
    display: "grid",
    gap: 12,
  },
  input: {
    height: 46,
    borderRadius: 12,
    border: "1px solid #d1d5db",
    padding: "0 14px",
    fontSize: 14,
    background: "#fff",
  },
  orText: {
    textAlign: "center",
    fontSize: 13,
    color: "#6b7280",
  },
  primaryBtn: {
    height: 46,
    border: "none",
    borderRadius: 12,
    background: "#2388ff",
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  error: {
    color: "#991b1b",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    padding: 12,
    borderRadius: 12,
    fontSize: 14,
  },
};