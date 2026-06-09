import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { AuthUser } from "../types";

export function Login({ onLogin }: { onLogin: (user: AuthUser) => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@securewatch.local");
  const [password, setPassword] = useState("Admin1234");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("securewatch_token", data.token);
      localStorage.setItem("securewatch_user", JSON.stringify(data.user));
      onLogin(data.user);
      navigate("/");
    } catch {
      setError("Could not sign in");
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>SecureWatch SIEM</h1>
        <p>Security operations dashboard</p>
        {error && <div className="error">{error}</div>}
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Sign in</button>
      </form>
    </main>
  );
}
