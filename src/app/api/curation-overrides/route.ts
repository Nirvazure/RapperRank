import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import {
  curationOverridesSchema,
  defaultCurationOverrides,
} from "@/features/curation/curation.schema";

const overridesPath = path.join(
  process.cwd(),
  "src",
  "data",
  "curation-overrides.json",
);

export async function GET() {
  try {
    const raw = await readFile(overridesPath, "utf8");
    const parsed = curationOverridesSchema.safeParse(JSON.parse(raw));

    if (!parsed.success) {
      return NextResponse.json(defaultCurationOverrides);
    }

    return NextResponse.json(parsed.data);
  } catch {
    return NextResponse.json(defaultCurationOverrides);
  }
}

export async function PUT(request: Request) {
  const body = await request.json();
  const parsed = curationOverridesSchema.safeParse({
    ...body,
    updatedAt: new Date().toISOString(),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid curation overrides payload" },
      { status: 400 },
    );
  }

  await mkdir(path.dirname(overridesPath), { recursive: true });
  await writeFile(overridesPath, `${JSON.stringify(parsed.data, null, 2)}\n`, "utf8");

  return NextResponse.json(parsed.data);
}
