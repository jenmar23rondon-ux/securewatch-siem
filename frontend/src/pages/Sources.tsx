import { FormEvent, useEffect, useState } from "react";
import { api } from "../services/api";
import { LogSource } from "../types";

const types = ["API_GATEWAY", "LINUX_SERVER", "AUTH_SERVICE", "FIREWALL", "DATABASE"];

export function Sources() {
  const [sources, setSources] = useState<LogSource[]>([]);
  const [form, setForm] = useState({ name: "API Gateway", type: "API_GATEWAY", description: "" });

  async function load() {
    const res = await api.get("/log-sources");
    setSources(res.data);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    await api.post("/log-sources", form);
    setForm({ name: "", type: "API_GATEWAY", description: "" });
    await load();
  }

  useEffect(() => { load(); }, []);

  return (
    <main className="page">
      <h1>Log Sources</h1>
      <form className="panel form-grid" onSubmit={submit}>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Source name" />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          {types.map((type) => <option key={type}>{type}</option>)}
        </select>
        <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" />
        <button>Create source</button>
      </form>
      <section className="panel">
        <table>
          <thead><tr><th>Name</th><th>Type</th><th>Status</th></tr></thead>
          <tbody>{sources.map((source) => (
            <tr key={source.id}><td>{source.name}</td><td>{source.type}</td><td>{source.active ? "Active" : "Disabled"}</td></tr>
          ))}</tbody>
        </table>
      </section>
    </main>
  );
}
