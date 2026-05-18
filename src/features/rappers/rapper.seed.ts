import { rappers as legacyRappers } from "@/data/rappers";
import { cleanSeedRapper } from "@/features/rappers/rapper.seed-clean";

export const rapperSeedRecords = legacyRappers.map(cleanSeedRapper);
