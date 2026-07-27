import type { ReactNode } from "react";

interface AnalyticsPanelProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

const AnalyticsPanel = ({
  title,
  description,
  action,
  children,
  className = "",
}: AnalyticsPanelProps) => (
  <section
    className={`rounded-3xl border border-white/10 bg-zinc-950/75 p-5 shadow-2xl shadow-black/20 ${className}`}
  >
    <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-zinc-500">{description}</p>
        ) : null}
      </div>

      {action}
    </header>

    {children}
  </section>
);

export default AnalyticsPanel;
