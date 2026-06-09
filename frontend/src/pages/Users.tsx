import { FormEvent, useEffect, useState } from "react";
import { api } from "../services/api";
import { AuthUser, Role } from "../types";

export function Users() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "VIEWER" as Role });

  async function load() {
    const res = await api.get("/users");
    setUsers(res.data);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    await api.post("/users", form);
    setForm({ name: "", email: "", password: "", role: "VIEWER" });
    await load();
  }

  useEffect(() => { load(); }, []);

  return (
    <main className="page">
      <h1>Users</h1>
      <form className="panel form-grid" onSubmit={submit}>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" />
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" />
        <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" type="password" />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
          <option>ADMIN</option>
          <option>ANALYST</option>
          <option>VIEWER</option>
        </select>
        <button>Create user</button>
      </form>
      <section className="panel">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
          <tbody>{users.map((user) => (
            <tr key={user.id}><td>{user.name}</td><td>{user.email}</td><td>{user.role}</td></tr>
          ))}</tbody>
        </table>
      </section>
    </main>
  );
}
