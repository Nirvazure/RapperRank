import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { appendFile, mkdir, open, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { legacyLabelDefinitions } from "../src/features/labels/label.data";
import { artWallOssIndices } from "../src/data/art-wall-indices";
import sourceNames from "../src/data/storage-source-names.json";
import { assignTargetKeys, exportMapping, inventory, prepareUpdates, type Manifest, type StaticReference } from "./storage-migration/core";
import { applyDatabase, snapshotSelect } from "./storage-migration/database";
import { verifyDeployment } from "./storage-migration/deployment";
import { createTransport, safeError } from "./storage-migration/transport";
import { assertSourcesUnchanged, copyAssets, loadManifest, manifestWriter, snapshotSources, validateLocalEvidence, verifyAssets } from "./storage-migration/workflow";

const HELP = `Usage: npx tsx scripts/migrate-storage.ts <plan|copy|verify|apply> [options]
  --run=<id or directory>   Defaults to latest .dev-data/storage-migration/runs run
  --sample                 Copy/verify representative names, MIME types, largest MP3
  --apply                  Apply verified DB changes (default is a dry run)
  --deployment=https://...  Required for apply --apply: compatible deployed production URL
  --deployment-id=<id>      Required for apply --apply: actual successful deployment ID

plan reads DB/static references and OSS metadata; copy creates named Storage objects without overwriting conflicts.
verify without --sample exports src/data/storage-assets.json only after full verification.
apply checks nullable DB references under a transaction lock and preserves all other columns.
apply --apply verifies the deployed mapping, transform recipes and deployment ID through its storage-version endpoint.
The local SUPABASE_SERVICE_ROLE_KEY is required only for copy uploads; never expose it in NEXT_PUBLIC variables.`;

type Options = { command: string; run?: string; sample: boolean; apply: boolean; deployment?: string; deploymentId?: string };

export function parseArguments(args: string[]): Options {
  const [command, ...flags] = args;
  if (!command || command === "--help" || command === "-h") return { command: "help", sample: false, apply: false };
  if (!["plan", "copy", "verify", "apply"].includes(command)) throw new Error("Expected plan, copy, verify, or apply (use --help)");
  const options: Options = { command, sample: false, apply: false };
  for (const flag of flags) {
    if (flag === "--sample") options.sample = true;
    else if (flag === "--apply") options.apply = true;
    else if (flag.startsWith("--run=")) options.run = flag.slice(6);
    else if (flag.startsWith("--deployment=")) options.deployment = flag.slice(13);
    else if (flag.startsWith("--deployment-id=")) options.deploymentId = flag.slice(16);
    else throw new Error(`Unknown option: ${flag}`);
  }
  if (options.sample && !["copy", "verify"].includes(command)) throw new Error("--sample is supported only by copy and verify");
  if (options.apply && command !== "apply") throw new Error("--apply is supported only by apply");
  return options;
}

function staticReferences(): StaticReference[] {
  return [
    ...legacyLabelDefinitions.map((label) => ({ id: `label:${label.id}`, field: "logoUrl", url: label.logoUrl })),
    ...artWallOssIndices.map((sourceIndex, index) => ({ id: `album:${index + 1}`, field: "coverUrl", url: `https://nirvazure-next.oss-cn-hangzhou.aliyuncs.com/album/art/${encodeURIComponent(`album (${sourceIndex + 1}).jpg`)}` })),
  ];
}

async function readMapping(root: string): Promise<Record<string, string>> {
  return JSON.parse(await readFile(path.join(root, "src/data/storage-assets.json"), "utf8")) as Record<string, string>;
}

async function resolveRun(root: string, options: Options): Promise<string> {
  const runs = path.join(root, ".dev-data/storage-migration/runs");
  if (options.run) return path.isAbsolute(options.run) ? options.run : /[/\\]/.test(options.run) ? path.resolve(root, options.run) : path.join(runs, options.run);
  if (options.command === "plan") return path.join(runs, `${new Date().toISOString().replace(/[:.]/g, "-")}-${randomUUID().slice(0, 8)}`);
  const directories = (await readdir(runs, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort().reverse();
  if (!directories.length) throw new Error("No migration run exists; run plan first");
  return path.join(runs, directories[0]);
}

export function deploymentAttestation(options: Pick<Options, "deployment" | "deploymentId">): { url: string; id: string; suppliedAt: string } {
  if (!options.deployment || !options.deploymentId?.trim()) throw new Error("apply --apply requires --deployment=<compatible production URL> and --deployment-id=<successful deployment ID>");
  const url = new URL(options.deployment);
  if (url.protocol !== "https:" || url.username || url.password || url.hash || url.search) throw new Error("Deployment URL must be an HTTPS URL without credentials/query/fragment");
  return { url: url.toString(), id: options.deploymentId, suppliedAt: new Date().toISOString() };
}

export async function main(args = process.argv.slice(2)): Promise<void> {
  const options = parseArguments(args);
  if (options.command === "help") { console.log(HELP); return; }
  const root = process.cwd();
  loadEnvConfig(root);
  const runDir = await resolveRun(root, options);
  if (options.command === "plan") await mkdir(runDir, { recursive: true });
  const lockFile = path.join(runDir, "run.lock");
  const lock = await open(lockFile, "wx").catch(() => { throw new Error(`Run is locked or unavailable: ${runDir}. If its previous process exited, remove run.lock before resuming.`); });
  await lock.writeFile(`${process.pid}\n`);
  const lines: string[] = [];
  const log = (message: string) => { const line = `${new Date().toISOString()} ${message}`; lines.push(line); console.log(line); };
  const prisma = new PrismaClient();
  try {
    log(`Run: ${runDir}; phase: ${options.command}${options.sample ? " (sample only)" : ""}`);
    let manifest: Manifest;
    if (options.command === "plan") {
      const existing = await readFile(path.join(runDir, "manifest.json"), "utf8").then(() => true, (error: NodeJS.ErrnoException) => { if (error.code === "ENOENT") return false; throw error; });
      if (existing) throw new Error("Plan will not replace an existing manifest; choose a new run");
      const rows = await prisma.rapper.findMany({ select: snapshotSelect, orderBy: { id: "asc" } });
      manifest = { format: 2, runId: path.basename(runDir), createdAt: new Date().toISOString(), ...inventory(rows, staticReferences(), await readMapping(root)) };
      assignTargetKeys(manifest.assets, sourceNames);
      const save = manifestWriter(runDir, manifest);
      await save();
      await snapshotSources(manifest, save);
      log(`Planned ${manifest.snapshot.length} rappers, ${manifest.assets.length} sources (${manifest.assets.filter((asset) => asset.kind === "image").length} images, ${manifest.assets.filter((asset) => asset.kind === "audio").length} audio); ${manifest.assets.reduce((bytes, asset) => bytes + (asset.version?.bytes ?? 0), 0)} bytes`);
      return;
    }
    manifest = await loadManifest(runDir);
    const save = manifestWriter(runDir, manifest);
    if (manifest.assets.some((asset) => !asset.version)) throw new Error("Plan is incomplete; create a successful plan before continuing");
    if (options.command === "copy") await copyAssets(manifest, runDir, createTransport(), options.sample, save, log);
    else if (options.command === "verify") {
      await verifyAssets(manifest, runDir, createTransport(), options.sample, save, log);
      if (!options.sample) {
        const mapping = exportMapping(manifest);
        await writeFile(path.join(root, "src/data/storage-assets.json"), `${JSON.stringify(mapping, null, 2)}\n`, "utf8");
        log(`Exported ${Object.keys(mapping).length} canonical source mappings`);
      }
    } else {
      await validateLocalEvidence(manifest, runDir);
      await assertSourcesUnchanged(manifest.assets);
      // Re-imported static URLs may already be resolved through the exported map.
      const currentInventory = inventory(manifest.snapshot, staticReferences(), await readMapping(root));
      if (JSON.stringify(currentInventory.assets.map(({ source, bindings }) => ({ source, bindings }))) !== JSON.stringify(manifest.assets.map(({ source, bindings }) => ({ source, bindings })))) throw new Error("Static references changed since plan; replan before apply");
      const rows = await prisma.rapper.findMany({ select: snapshotSelect, orderBy: { id: "asc" } });
      const updates = prepareUpdates(manifest, rows);
      if (!options.apply) { log(`DRY RUN: ${updates.length} rappers would receive verified media URLs; no DB writes`); return; }
      const deployment = await verifyDeployment(manifest, deploymentAttestation(options));
      manifest.deployment = deployment;
      await save();
      const count = await applyDatabase(prisma, manifest);
      manifest.appliedAt = new Date().toISOString();
      await save();
      log(`Applied ${count} rapper media updates; compatible deployment supplied by operator: ${deployment.url} (${deployment.id})`);
    }
  } catch (error) {
    log(`ERROR: ${safeError(error)}`);
    throw error;
  } finally {
    await prisma.$disconnect();
    await appendFile(path.join(runDir, "migration.log"), `${lines.join("\n")}\n`, "utf8");
    await lock.close();
    await unlink(lockFile);
  }
}

if (process.argv[1] && /(?:^|[/\\])migrate-storage\.(?:ts|js)$/.test(process.argv[1])) {
  main().catch((error) => { console.error(safeError(error)); process.exitCode = 1; });
}
