import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { playbackEvidenceSchema } from "./content/assets";
import { isCheckedSource, safePlaybackUrl } from "../src/features/content/content.policy";
import { safeError } from "./content/safe-error";

loadEnvConfig(process.cwd());
const db = new PrismaClient();
async function main() {
  const args = process.argv.slice(2);
  const evidenceFile = args.find((arg) => arg.startsWith("--evidence="))?.slice(11);
  if (args.includes("--apply") && !evidenceFile) throw new Error("--apply requires recent browser evidence; HTTP success alone cannot approve playback");
  if (evidenceFile) {
    const evidence = playbackEvidenceSchema.parse(JSON.parse(await readFile(evidenceFile, "utf8")));
    await db.$transaction(async (tx) => {
      for (const item of evidence) {
        const source = await tx.playbackSource.findUniqueOrThrow({ where: { id: item.id } });
        if (source.url !== item.url || (source.kind === "external") !== (item.checkType === "external_page") || source.reviewStatus !== "approved" || !safePlaybackUrl(source)) throw new Error(`Evidence identity mismatch: ${item.id}`);
        const observation = item.checkType === "external_page" ? "official page identity and regional conditions observed" : `observed ${item.observedSeconds}s, pause=${item.pausedObserved}`;
        if (args.includes("--apply")) await tx.playbackSource.update({ where: { id: item.id, url: item.url, checkedAt: source.checkedAt }, data: { status: item.outcome, checkedAt: new Date(item.checkedAt), durationSeconds: item.durationSeconds ? Math.round(item.durationSeconds) : null, verificationNote: `${item.reviewer}: ${item.note}; ${observation}` } });
      }
    }, { timeout: 120000 });
    console.log(`Validated ${evidence.length} evidence records; applied=${args.includes("--apply")}`);
  }
  const rows = await db.playbackSource.findMany({ orderBy: { id: "asc" } });
  const report = [];
  // Check a bounded, explicit sample by default. --all probes the entire catalog.
  const targets = args.includes("--all") ? rows : rows.filter((source) => source.kind !== "external" && source.status === "available");
  for (const source of targets) {
    let httpStatus: number | null = null, error: string | null = null;
    if (safePlaybackUrl(source)) try {
      const response = await fetch(source.url, { method: "HEAD", signal: AbortSignal.timeout(15000), redirect: "manual" });
      httpStatus = response.status;
      await response.body?.cancel();
    } catch { error = "Network probe failed or timed out"; }
    else error = "URL is outside approved hosts";
    report.push({ id: source.id, kind: source.kind, status: source.status, checkedAt: source.checkedAt, fresh: isCheckedSource(source), httpStatus, error, note: "HTTP accessibility does not prove audio playback or mainland availability." });
  }
  await mkdir(".dev-data/content", { recursive: true });
  await writeFile(".dev-data/content/verification-report.json", JSON.stringify({ generatedAt: new Date().toISOString(), totalSources: rows.length, playableSources: rows.filter((source) => source.kind !== "external" && isCheckedSource(source)).length, probes: report }, null, 2));
  console.log(JSON.stringify({ totalSources: rows.length, checkedPlayable: rows.filter((source) => source.kind !== "external" && isCheckedSource(source)).length, probes: report }, null, 2));
}
main().catch((error) => { console.error(safeError(error)); process.exitCode = 1; }).finally(() => db.$disconnect());
