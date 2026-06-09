import { AlertTriangle, Globe2, ShieldAlert, Siren, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StatCard } from "../components/StatCard";
import { api } from "../services/api";
import { alertsSocket } from "../sockets/alertsSocket";
import { Alert, SecurityEvent } from "../types";

type DashboardData = {
  totalEvents: number;
  openAlerts: number;
  criticalThreats: number;
  eventsBySeverity: { severity: string; count: number }[];
  topIps: { ip: string; count: number }[];
  eventsByHour: { hour: string; count: number }[];
  recentEvents: SecurityEvent[];
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
    alertsSocket.on("metrics-update", (metrics: DashboardData) => {
      setData(metrics);
    });
    alertsSocket.on("new-event", (event: SecurityEvent) => {
      setData((current) => current ? {
        ...current,
        recentEvents: [event, ...(current.recentEvents || [])].slice(0, 10)
      } : current);
    });
    alertsSocket.on("new-alert", (alert: Alert) => {
      setLiveAlerts((items) => [alert, ...items].slice(0, 5));
    });
    alertsSocket.on("alert:new", (alert: Alert) => {
      setLiveAlerts((items) => [alert, ...items].slice(0, 5));
      load();
    });
    return () => {
      alertsSocket.off("alert:new");
      alertsSocket.off("new-alert");
      alertsSocket.off("new-event");
      alertsSocket.off("metrics-update");
      alertsSocket.disconnect();
    };
  }, []);

  const hourlyData = (data?.eventsByHour || [])
    .slice()
    .reverse()
    .map((item) => ({
      ...item,
      label: new Date(item.hour).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }));

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
      <div className="grid-two">
        <section className="panel">
          <h2>Events by hour</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#60a5fa" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </section>
        <section className="panel attack-map">
          <h2><Globe2 size={20} /> Attacker IP map</h2>
          <div className="map-surface">
            {(data?.topIps || []).map((item, index) => (
              <span
                className="map-dot"
                key={item.ip}
                style={{
                  left: `${12 + (index * 17) % 75}%`,
                  top: `${20 + (index * 23) % 58}%`
                }}
                title={`${item.ip} - ${item.count} events`}
              />
            ))}
          </div>
          <div className="ip-list">
            {(data?.topIps || []).slice(0, 5).map((item) => (
              <span key={item.ip}>{item.ip} · {item.count}</span>
            ))}
          </div>
        </section>
      </div>
      <section className="panel">
        <h2>Event timeline</h2>
        <div className="timeline">
          {(data?.recentEvents || []).map((event) => (
            <div className="timeline-item" key={event.id}>
              <span className={`badge ${event.severity.toLowerCase()}`}>{event.severity}</span>
              <strong>{event.type}</strong>
              <span>{event.ip}</span>
              <small>{new Date(event.createdAt).toLocaleString()}</small>
            </div>
          ))}
        </div>
      </section>
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
