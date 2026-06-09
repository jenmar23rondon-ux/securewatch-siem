import { AlertTriangle, BarChart3, FileText, LogOut, Radar, Server, Shield, Users } from "lucide-react";
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

export function Navbar({ user, onLogout }: { user: AuthUser | null; onLogout: () => void }) {
  const navigate = useNavigate();

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
