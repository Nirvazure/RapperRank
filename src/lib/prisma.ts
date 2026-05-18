import { PrismaClient } from "@prisma/client";

declare global {
  var __rapperankPrisma: PrismaClient | undefined;
}

export const prisma =
  global.__rapperankPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__rapperankPrisma = prisma;
}
