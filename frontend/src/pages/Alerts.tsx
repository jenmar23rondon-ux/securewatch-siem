import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Alert } from "../types";

export function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  async function load() {
    const res = await api.get("/alerts");
    setAlerts(res.data);
  }

  async function setStatus(id: number, status: string) {
    await api.patch(`/alerts/${id}/status`, { status });
    await load();
  }

  useEffect(() => { load(); }, []);

  return (
    <main className="page">
      <h1>Alerts</h1>
      <section className="panel">
        <table>
          <thead><tr><th>Title</th><th>IP</th><th>Severity</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{alerts.map((alert) => (
            <tr key={alert.id}>
              <td><strong>{alert.title}</strong><br /><span className="muted">{alert.message}</span></td>
              <td>{alert.event?.ip}</td>
              <td><span className={`badge ${alert.severity.toLowerCase()}`}>{alert.severity}</span></td>
              <td>{alert.status}</td>
              <td className="actions">
                <button onClick={() => setStatus(alert.id, "ACKNOWLEDGED")}>Acknowledge</button>
                <button onClick={() => setStatus(alert.id, "RESOLVED")}>Resolve</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </section>
    </main>
  );
}
