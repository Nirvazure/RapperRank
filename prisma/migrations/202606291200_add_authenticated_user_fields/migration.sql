-- AlterEnum
ALTER TYPE "rapperank"."UserKind" ADD VALUE 'AUTHENTICATED';

-- AlterTable
ALTER TABLE "rapperank"."User" ADD COLUMN "auth_user_id" TEXT,
ADD COLUMN "display_name" TEXT,
ADD COLUMN "avatar_url" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_auth_user_id_key" ON "rapperank"."User"("auth_user_id");
