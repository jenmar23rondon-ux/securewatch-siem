import { Request, Response } from "express";
import PDFDocument from "pdfkit";
import { prisma } from "../../config/prisma";

function csvEscape(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export async function exportAlertsCsv(_req: Request, res: Response) {
  const alerts = await prisma.alert.findMany({
    include: { event: true },
    orderBy: { createdAt: "desc" },
    take: 500
  });

  const rows = [
    ["id", "title", "severity", "status", "ip", "eventType", "createdAt"],
    ...alerts.map((alert) => [
      alert.id,
      alert.title,
      alert.severity,
      alert.status,
      alert.event.ip,
      alert.event.type,
      alert.createdAt.toISOString()
    ])
  ];

  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=securewatch-alerts.csv");
  return res.send(csv);
}

export async function exportAlertsPdf(_req: Request, res: Response) {
  const alerts = await prisma.alert.findMany({
    include: { event: true },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  const doc = new PDFDocument({ margin: 42, size: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=securewatch-alerts.pdf");
  doc.pipe(res);

  doc.fontSize(20).text("SecureWatch SIEM - Alerts Report", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor("#475569").text(`Generated at: ${new Date().toISOString()}`);
  doc.moveDown();

  alerts.forEach((alert, index) => {
    if (doc.y > 720) doc.addPage();
    doc.fillColor("#0f172a").fontSize(12).text(`${index + 1}. ${alert.title}`);
    doc.fillColor("#334155").fontSize(9)
      .text(`Severity: ${alert.severity} | Status: ${alert.status} | IP: ${alert.event.ip}`)
      .text(`Event: ${alert.event.type} | Date: ${alert.createdAt.toISOString()}`)
      .text(alert.message);
    doc.moveDown(0.7);
  });

  if (alerts.length === 0) {
    doc.fillColor("#334155").fontSize(12).text("No alerts found.");
  }

  doc.end();
}
