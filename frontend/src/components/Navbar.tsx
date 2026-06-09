import { AlertTriangle, BarChart3, FileText, LogOut, Moon, Radar, Server, Shield, Sun, Users } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthUser } from "../types";

const links = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/events", label: "Events", icon: Radar },
  { to: "/alerts", label: "Alerts", icon: AlertTriangle },
  { to: "/threats", label: "Threats", icon: Shield },
  { to: "/sources", label: "Sources", icon: Server },
  { to: "/users", label: "Users", icon: Users },
  { to: "/reports", label: "Reports", icon: FileText }
];

type NavbarProps = {
  user: AuthUser | null;
  onLogout: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
};

export function Navbar({ user, onLogout, theme, onToggleTheme }: NavbarProps) {
  const navigate = useNavigate();
  const ThemeIcon = theme === "dark" ? Sun : Moon;

  return (
    <nav className="topbar">
      <Link className="brand" to="/">
        <Shield size={22} />
        SecureWatch
      </Link>
      {user && (
        <>
          <div className="nav-links">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to}>
                  <Icon size={16} />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
          <div className="session">
            <span>{user.name} ({user.role})</span>
            <button
              className="theme-toggle icon-button"
              onClick={onToggleTheme}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              <ThemeIcon size={18} />
            </button>
            <button
              className="danger icon-button"
              onClick={() => {
                onLogout();
                navigate("/login");
              }}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </>
      )}
    </nav>
  );
}
