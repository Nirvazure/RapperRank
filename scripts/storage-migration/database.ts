import { Prisma, type PrismaClient } from "@prisma/client";
import { prepareUpdates, type Manifest, type RowSnapshot } from "./core";

export const snapshotSelect = { id: true, avatarUrl: true, mediaUrl: true, backgroundAudioUrl: true } as const;
export interface ApplyTransaction {
  lock(): Promise<void>;
  snapshot(): Promise<RowSnapshot[]>;
  compareAndSet(before: RowSnapshot, after: RowSnapshot): Promise<number>;
}

/** The adapter must hold its write lock for the entire transaction. */
export async function applyInTransaction(manifest: Manifest, transaction: ApplyTransaction): Promise<number> {
  await transaction.lock();
  const updates = prepareUpdates(manifest, await transaction.snapshot());
  for (const { before, after } of updates) {
    if (await transaction.compareAndSet(before, after) !== 1) throw new Error(`Conditional update failed: ${before.id}; transaction must roll back`);
  }
  return updates.length;
}

export async function applyDatabase(prisma: PrismaClient, manifest: Manifest): Promise<number> {
  return prisma.$transaction(async (tx) => applyInTransaction(manifest, {
    async lock() {
      // Block inserts as well as updates/deletes until the snapshot comparison and
      // conditional updates commit together. No @updatedAt or aggregate writes.
      await tx.$executeRaw`LOCK TABLE "rapperank"."Rapper" IN SHARE ROW EXCLUSIVE MODE`;
    },
    snapshot: () => tx.rapper.findMany({ select: snapshotSelect, orderBy: { id: "asc" } }),
    async compareAndSet(before, after) {
      return tx.$executeRaw`
        UPDATE "rapperank"."Rapper"
        SET "avatarUrl" = ${after.avatarUrl}, "mediaUrl" = ${after.mediaUrl}, "backgroundAudioUrl" = ${after.backgroundAudioUrl}
        WHERE "id" = ${before.id}
          AND "avatarUrl" IS NOT DISTINCT FROM ${before.avatarUrl}
          AND "mediaUrl" IS NOT DISTINCT FROM ${before.mediaUrl}
          AND "backgroundAudioUrl" IS NOT DISTINCT FROM ${before.backgroundAudioUrl}
      `;
    },
  }), { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 10_000, timeout: 30_000 });
}
