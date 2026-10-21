import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { mkdir, writeFile } from "node:fs/promises";
import { fetchAppleCatalog } from "./content/discovery";

loadEnvConfig(process.cwd());
const db = new PrismaClient();
const names = ["GAI", "王以太", "Jony J", "法老", "马思唯"];
async function main() {
  const artists = await db.rapper.findMany({ where: { name: { in: names } }, select: { id: true, name: true, bio: true, representativeWorks: true } });
  const output = [];
  for (const artist of artists) {
    // The Chinese iTunes music storefront may be empty. Never relabel another region as CN.
    const cn = await fetchAppleCatalog(artist.name, "cn");
    const us = await fetchAppleCatalog(artist.name, "us");
    output.push({ ...artist, catalogs: { cn, us } });
    console.log(`${artist.name}: CN=${cn.length}, US=${us.length}`);
  }
  await mkdir(".dev-data/content", { recursive: true });
  await writeFile(".dev-data/content/pilot-discovery.json", JSON.stringify({ retrievedAt: new Date().toISOString(), artists: output }, null, 2));
}
main().catch(() => { console.error("Content discovery failed; no database writes performed."); process.exitCode = 1; }).finally(() => db.$disconnect());
