import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import {
  planRapperImageImports,
  type RapperImageImportIssue,
  type RapperImageImportPlanItem,
} from "./rapper-image-import";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

function parseArgs(argv: string[]) {
  const apply = argv.includes("--apply");
  const baseUrl = argv
    .find((value) => value.startsWith("--base-url="))
    ?.slice("--base-url=".length);

  return {
    apply,
    baseUrl,
  };
}

function formatCandidate(item: { id: string; seedKey: string | null; name: string }) {
  return `${item.name} [id=${item.id}${item.seedKey ? ` seedKey=${item.seedKey}` : ""}]`;
}

function printPlanItems(items: RapperImageImportPlanItem[]) {
  for (const item of items) {
    console.log(
      [
        item.entry.fileName,
        `=> ${item.rapper.name}`,
        `(match=${item.matchType})`,
        `mediaUrl=${item.nextMediaUrl}`,
        `avatarUrl=null`,
      ].join(" "),
    );
  }
}

function printIssues(issues: RapperImageImportIssue[]) {
  for (const issue of issues) {
    if (issue.reason === "unmatched") {
      console.error(`UNMATCHED ${issue.entry.fileName}`);
      continue;
    }

    console.error(
      `AMBIGUOUS ${issue.entry.fileName} (${issue.matchType}): ${issue.candidates.map(formatCandidate).join(", ")}`,
    );
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const rappers = await prisma.rapper.findMany({
    select: {
      id: true,
      seedKey: true,
      name: true,
      aliases: true,
      mediaUrl: true,
      avatarUrl: true,
    },
  });

  const { planned, issues } = planRapperImageImports(rappers, {
    baseUrl: args.baseUrl,
  });

  console.log(`Planned updates: ${planned.length}`);
  printPlanItems(planned);

  if (issues.length > 0) {
    console.error(`Issues: ${issues.length}`);
    printIssues(issues);
    process.exitCode = 1;
    return;
  }

  if (!args.apply) {
    console.log("Dry-run complete. Re-run with --apply to write updates.");
    return;
  }

  await prisma.$transaction(
    planned.map((item) =>
      prisma.rapper.update({
        where: { id: item.rapper.id },
        data: {
          mediaUrl: item.nextMediaUrl,
          avatarUrl: item.nextAvatarUrl,
        },
      }),
    ),
  );

  console.log(`Applied ${planned.length} rapper image updates.`);
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
