-- AlterTable
ALTER TABLE "rapperank"."Rapper"
ADD COLUMN "avgFondness" DECIMAL(3,1) NOT NULL DEFAULT 0,
ADD COLUMN "fondnessCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "rapperank"."Rating"
ADD COLUMN "fondness" DECIMAL(3,1);
