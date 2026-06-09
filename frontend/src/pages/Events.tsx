import { FormEvent, useEffect, useState } from "react";
import { api } from "../services/api";
import { EventType, LogSource, SecurityEvent } from "../types";

export function Events() {
  const [sources, setSources] = useState<LogSource[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [form, setForm] = useState({
    type: "LOGIN_FAILED" as EventType,
    sourceId: 1,
    ip: "181.50.12.10",
    payload: "' OR 1=1 --",
    failedAttempts: 10,
    requestCount: 20
  });

  async function load() {
    const [sourcesRes, eventsRes] = await Promise.all([
      api.get("/log-sources"),
      api.get("/events")
    ]);
    setSources(sourcesRes.data);
    setEvents(eventsRes.data);
    if (sourcesRes.data[0]) setForm((prev) => ({ ...prev, sourceId: sourcesRes.data[0].id }));
  }

  useEffect(() => { load(); }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    await api.post("/events", form);
    await load();
  }

  return (
    <main className="page">
      <h1>Security Events</h1>
      <form className="panel form-grid" onSubmit={submit}>
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as EventType })}>
          {["LOGIN_SUCCESS", "LOGIN_FAILED", "SQL_INJECTION_ATTEMPT", "DDOS_ATTEMPT", "PORT_SCAN", "SUSPICIOUS_IP"].map((type) => <option key={type}>{type}</option>)}
        </select>
        <select value={form.sourceId} onChange={(e) => setForm({ ...form, sourceId: Number(e.target.value) })}>
          {sources.map((source) => <option key={source.id} value={source.id}>{source.name}</option>)}
        </select>
        <input value={form.ip} onChange={(e) => setForm({ ...form, ip: e.target.value })} placeholder="IP address" />
        <input value={form.payload} onChange={(e) => setForm({ ...form, payload: e.target.value })} placeholder="Payload" />
        <input type="number" value={form.failedAttempts} onChange={(e) => setForm({ ...form, failedAttempts: Number(e.target.value) })} />
        <input type="number" value={form.requestCount} onChange={(e) => setForm({ ...form, requestCount: Number(e.target.value) })} />
        <button>Send event</button>
      </form>
      <section className="panel">
        <h2>Recent events</h2>
        <table>
          <thead><tr><th>Type</th><th>Source</th><th>IP</th><th>Severity</th><th>Date</th></tr></thead>
          <tbody>{events.map((item) => (
            <tr key={item.id}><td>{item.type}</td><td>{item.source?.name}</td><td>{item.ip}</td><td><span className={`badge ${item.severity.toLowerCase()}`}>{item.severity}</span></td><td>{new Date(item.createdAt).toLocaleString()}</td></tr>
          ))}</tbody>
        </table>
      </section>
    </main>
  );
}
