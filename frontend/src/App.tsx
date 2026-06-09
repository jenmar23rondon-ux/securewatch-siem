import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Alerts } from "./pages/Alerts";
import { Dashboard } from "./pages/Dashboard";
import { Events } from "./pages/Events";
import { Login } from "./pages/Login";
import { Reports } from "./pages/Reports";
import { Sources } from "./pages/Sources";
import { Threats } from "./pages/Threats";
import { Users } from "./pages/Users";
import { AuthUser } from "./types";

function Protected({ user, children }: { user: AuthUser | null; children: JSX.Element }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("securewatch_user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  function logout() {
    localStorage.removeItem("securewatch_token");
    localStorage.removeItem("securewatch_user");
    setUser(null);
  }

  return (
    <>
      <Navbar user={user} onLogout={logout} />
      <Routes>
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="/" element={<Protected user={user}><Dashboard /></Protected>} />
        <Route path="/events" element={<Protected user={user}><Events /></Protected>} />
        <Route path="/alerts" element={<Protected user={user}><Alerts /></Protected>} />
        <Route path="/threats" element={<Protected user={user}><Threats /></Protected>} />
        <Route path="/sources" element={<Protected user={user}><Sources /></Protected>} />
        <Route path="/users" element={<Protected user={user}><Users /></Protected>} />
        <Route path="/reports" element={<Protected user={user}><Reports /></Protected>} />
      </Routes>
    </>
  );
}
