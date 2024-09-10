/*
  Warnings:

  - The values [AUDIO] on the enum `MediaType` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[key]` on the table `Media` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MediaType_new" AS ENUM ('IMAGE', 'VIDEO');
ALTER TABLE "Media" ALTER COLUMN "type" TYPE "MediaType_new" USING ("type"::text::"MediaType_new");
ALTER TYPE "MediaType" RENAME TO "MediaType_old";
ALTER TYPE "MediaType_new" RENAME TO "MediaType";
DROP TYPE "MediaType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "key" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Media_key_key" ON "Media"("key");
