"use client";

import { Copy, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { CurationExport, CurationOverrides } from "@/features/curation/curation.types";

export function CurationExportPanel({
  exportData,
  onSaved,
}: {
  exportData: CurationExport;
  onSaved: (exportData: CurationOverrides) => void;
}) {
  const [status, setStatus] = useState<string>("");
  const json = useMemo(() => JSON.stringify(exportData, null, 2), [exportData]);
  const overridesJson = useMemo(() => {
    return JSON.stringify(
      {
        version: exportData.version,
        updatedAt: exportData.updatedAt,
        excludedRapperIds: exportData.excludedRapperIds,
        ratingOverrides: exportData.ratingOverrides,
      },
      null,
      2,
    );
  }, [exportData]);

  async function copyJson() {
    await navigator.clipboard.writeText(json);
    setStatus("Copied JSON");
  }

  async function saveToFile() {
    setStatus("Saving...");
    const response = await fetch("/api/curation-overrides", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: overridesJson,
    });

    if (!response.ok) {
      setStatus(`Save failed: ${await response.text()}`);
      return;
    }

    const saved = (await response.json()) as CurationOverrides;
    onSaved(saved);
    setStatus("Saved to file");
  }

  return (
    <aside className="grid gap-3 rounded-lg border border-white/10 bg-zinc-950/90 p-4 text-white">
      <div className="grid grid-cols-2 gap-2">
        <Metric label="total" value={exportData.summary.total} />
        <Metric label="retained" value={exportData.summary.retained} />
        <Metric label="deleted" value={exportData.summary.excluded} />
        <Metric label="rated" value={exportData.summary.ratingOverrides} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          className="bg-lime-200 text-black hover:bg-lime-100"
          onClick={saveToFile}
        >
          <Save className="size-4" />
          Save file
        </Button>
        <Button
          type="button"
          variant="outline"
          className="border-white/15 bg-black/30 text-white hover:bg-white/10 hover:text-white"
          onClick={copyJson}
        >
          <Copy className="size-4" />
          Copy JSON
        </Button>
      </div>
      {status ? <p className="text-xs font-bold text-lime-200">{status}</p> : null}
      <pre className="max-h-[520px] overflow-auto rounded-md border border-white/10 bg-black/45 p-3 text-xs leading-5 text-white/65">
        {json}
      </pre>
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.06] px-3 py-2 text-right">
      <p className="font-mono text-2xl font-black text-lime-200">{value}</p>
      <p className="text-[10px] font-black uppercase text-white/40">{label}</p>
    </div>
  );
}
