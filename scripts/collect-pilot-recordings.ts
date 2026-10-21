import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fetchAppleCatalog } from "./content/discovery";

async function main() {
  const discovery = JSON.parse(await readFile(".dev-data/content/pilot-discovery.json", "utf8"));
  const extra: Record<string, unknown[]> = {};
  for (const artist of discovery.artists) {
    extra[artist.name] = [];
    for (const title of artist.representativeWorks) {
      const rows = await fetchAppleCatalog(`${artist.name} ${title}`, "us");
      extra[artist.name].push(...rows);
      console.log(`${artist.name} / ${title}: ${rows.length} candidates`);
    }
  }
  // Explicit official releases found in research, including non-literal translated titles.
  const releases = ["1537746124", "1529076578", "1724866903", "1630228453", "1754997818", "1882700100", "1610248121"];
  const albums: Record<string, unknown[]> = {};
  for (const release of releases) {
    const response = await fetch(`https://itunes.apple.com/lookup?id=${release}&country=us&entity=song`, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`Lookup HTTP ${response.status}`);
    albums[release] = (await response.json()).results;
  }
  await mkdir(".dev-data/content", { recursive: true });
  await writeFile(".dev-data/content/recordings.json", JSON.stringify({ retrievedAt: new Date().toISOString(), extra, albums }, null, 2));
}
main().catch(() => { console.error("Pilot recording collection failed"); process.exitCode = 1; });
