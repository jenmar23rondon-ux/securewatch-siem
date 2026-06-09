import { API_URL } from "../services/api";

export function Reports() {
  const token = localStorage.getItem("securewatch_token");
  const url = `${API_URL}/reports/alerts.csv`;

  return (
    <main className="page">
      <h1>Reports</h1>
      <section className="panel">
        <h2>Alerts CSV</h2>
        <p className="muted">Export the latest alerts as a CSV file for incident review.</p>
        <a className="button-link" href={url} onClick={(event) => {
          if (!token) event.preventDefault();
        }}>
          Download alerts CSV
        </a>
        <p className="muted small">If your browser asks for authorization, use the API with the Bearer token from local storage.</p>
      </section>
    </main>
  );
}
