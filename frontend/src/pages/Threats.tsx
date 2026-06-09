import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Threat } from "../types";

export function Threats() {
  const [threats, setThreats] = useState<Threat[]>([]);

  useEffect(() => {
    api.get("/threats").then((res) => setThreats(res.data));
  }, []);

  return (
    <main className="page">
      <h1>Threats</h1>
      <section className="panel">
        <table>
          <thead><tr><th>Name</th><th>Rule</th><th>IP</th><th>Score</th><th>Severity</th></tr></thead>
          <tbody>{threats.map((threat) => (
            <tr key={threat.id}>
              <td>{threat.name}</td>
              <td>{threat.rule}</td>
              <td>{threat.event?.ip}</td>
              <td>{threat.score}</td>
              <td><span className={`badge ${threat.severity.toLowerCase()}`}>{threat.severity}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </section>
    </main>
  );
}
