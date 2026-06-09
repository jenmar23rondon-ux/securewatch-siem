import { api } from "../services/api";

export function Reports() {
  async function downloadReport(path: string, filename: string) {
    const response = await api.get(path, { responseType: "blob" });
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <main className="page">
      <h1>Reports</h1>
      <section className="panel">
        <h2>Alert exports</h2>
        <p className="muted">Export the latest alerts as CSV or PDF for incident review.</p>
        <div className="actions">
          <button onClick={() => downloadReport("/reports/alerts.csv", "securewatch-alerts.csv")}>Download CSV</button>
          <button onClick={() => downloadReport("/reports/alerts.pdf", "securewatch-alerts.pdf")}>Download PDF</button>
        </div>
      </section>
    </main>
  );
}
