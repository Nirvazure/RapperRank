-- Add new columns
ALTER TABLE "rapperank"."Rapper" ADD COLUMN "seedKey" TEXT;
ALTER TABLE "rapperank"."Rapper" ADD COLUMN "aliases" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Migrate seedKey from slug
UPDATE "rapperank"."Rapper" SET "seedKey" = "slug";

-- Migrate aliases from alias and chineseName
UPDATE "rapperank"."Rapper" r
SET "aliases" = ARRAY(
  SELECT DISTINCT unnest(
    ARRAY_CAT(
      CASE WHEN r."alias" IS NOT NULL AND btrim(r."alias") <> '' THEN ARRAY[r."alias"] ELSE ARRAY[]::TEXT[] END,
      CASE
        WHEN r."chineseName" IS NOT NULL
          AND btrim(r."chineseName") <> ''
          AND r."chineseName" <> r."name"
          AND (r."alias" IS NULL OR r."chineseName" <> r."alias")
        THEN ARRAY[r."chineseName"]
        ELSE ARRAY[]::TEXT[]
      END
    )
  )
);

-- Prefer shortReview when bio is placeholder or garbled
UPDATE "rapperank"."Rapper"
SET "bio" = "shortReview"
WHERE (
  "bio" LIKE '%???%'
  OR "bio" LIKE '%资料待补充%'
  OR "bio" LIKE '%锛%'
  OR "bio" LIKE '%銆%'
)
AND "shortReview" IS NOT NULL
AND "shortReview" NOT LIKE '%???%';

-- Drop old columns and enum
DROP INDEX IF EXISTS "rapperank"."Rapper_slug_key";
ALTER TABLE "rapperank"."Rapper" DROP COLUMN "slug";
ALTER TABLE "rapperank"."Rapper" DROP COLUMN "chineseName";
ALTER TABLE "rapperank"."Rapper" DROP COLUMN "alias";
ALTER TABLE "rapperank"."Rapper" DROP COLUMN "shortReview";
ALTER TABLE "rapperank"."Rapper" DROP COLUMN "contentStatus";

DROP TYPE IF EXISTS "rapperank"."ContentStatus";

-- Unique seedKey (nullable)
CREATE UNIQUE INDEX "Rapper_seedKey_key" ON "rapperank"."Rapper"("seedKey");
