import { AlertTriangle, ShieldAlert, Siren, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StatCard } from "../components/StatCard";
import { api } from "../services/api";
import { alertsSocket } from "../sockets/alertsSocket";
import { Alert } from "../types";

type DashboardData = {
  totalEvents: number;
  openAlerts: number;
  criticalThreats: number;
  eventsBySeverity: { severity: string; count: number }[];
  topIps: { ip: string; count: number }[];
};

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [liveAlerts, setLiveAlerts] = useState<Alert[]>([]);

  async function load() {
    const res = await api.get("/dashboard");
    setData(res.data);
  }

  useEffect(() => {
    load();
    alertsSocket.connect();
    alertsSocket.on("alert:new", (alert: Alert) => {
      setLiveAlerts((items) => [alert, ...items].slice(0, 5));
      load();
    });
    return () => {
      alertsSocket.off("alert:new");
      alertsSocket.disconnect();
    };
  }, []);

  return (
    <main className="page">
      <h1>Security Command Center</h1>
      <p className="muted">Live monitoring for events, threats and alerts.</p>
      <div className="stats-grid">
        <StatCard title="Total events" value={data?.totalEvents ?? 0} icon={Siren} />
        <StatCard title="Open alerts" value={data?.openAlerts ?? 0} icon={AlertTriangle} />
        <StatCard title="Critical threats" value={data?.criticalThreats ?? 0} icon={ShieldAlert} />
        <StatCard title="Suspicious IPs" value={data?.topIps?.length ?? 0} icon={Users} />
      </div>
      <div className="grid-two">
        <section className="panel">
          <h2>Events by severity</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data?.eventsBySeverity || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="severity" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#38bdf8" />
            </BarChart>
          </ResponsiveContainer>
        </section>
        <section className="panel">
          <h2>Top suspicious IPs</h2>
          <table>
            <tbody>
              {data?.topIps?.map((item) => (
                <tr key={item.ip}>
                  <td>{item.ip}</td>
                  <td>{item.count} events</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
      <section className="panel">
        <h2>Realtime alerts</h2>
        {liveAlerts.length === 0 ? <p className="muted">No realtime alerts yet.</p> : liveAlerts.map((alert) => (
          <div className="alert-row" key={alert.id}>
            <strong>{alert.title}</strong>
            <span className={`badge ${alert.severity.toLowerCase()}`}>{alert.severity}</span>
          </div>
        ))}
      </section>
    </main>
  );
}
