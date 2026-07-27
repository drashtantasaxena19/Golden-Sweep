import { useState } from "react";

import type {
  AnalyticsExportFormat,
  AnalyticsSection,
} from "../../types/analytics";

interface AnalyticsExportMenuProps {
  loading?: boolean;
  onExport: (
    format: AnalyticsExportFormat,
    section: AnalyticsSection,
  ) => Promise<void>;
}

const AnalyticsExportMenu = ({
  loading = false,
  onExport,
}: AnalyticsExportMenuProps) => {
  const [format, setFormat] =
    useState<AnalyticsExportFormat>("xlsx");
  const [section, setSection] =
    useState<AnalyticsSection>("full");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label="Export section"
        value={section}
        onChange={(event) =>
          setSection(event.target.value as AnalyticsSection)
        }
        className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-zinc-200 outline-none"
      >
        <option value="full">Full report</option>
        <option value="overview">Overview</option>
        <option value="revenue">Revenue</option>
        <option value="users">Users</option>
        <option value="wallet">Wallet</option>
        <option value="transactions">Transactions</option>
        <option value="games">Games</option>
      </select>

      <select
        aria-label="Export format"
        value={format}
        onChange={(event) =>
          setFormat(event.target.value as AnalyticsExportFormat)
        }
        className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-zinc-200 outline-none"
      >
        <option value="xlsx">XLSX</option>
        <option value="csv">CSV</option>
        <option value="pdf">PDF</option>
      </select>

      <button
        type="button"
        disabled={loading}
        onClick={() => void onExport(format, section)}
        className="h-10 rounded-xl border border-amber-300/30 bg-amber-400/10 px-4 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Exporting…" : "Export"}
      </button>
    </div>
  );
};

export default AnalyticsExportMenu;
