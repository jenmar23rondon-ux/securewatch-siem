import { LucideIcon } from "lucide-react";

export function StatCard({
  title,
  value,
  icon: Icon
}: {
  title: string;
  value: number | string;
  icon: LucideIcon;
}) {
  return (
    <section className="stat-card">
      <Icon size={24} />
      <div>
        <strong>{value}</strong>
        <span>{title}</span>
      </div>
    </section>
  );
}
