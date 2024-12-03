/*
  Warnings:

  - You are about to drop the column `profilePicKey` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profilePicUrl` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[profilePicId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "MediaCategory" ADD VALUE 'PROFILE_PIC';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "profilePicKey",
DROP COLUMN "profilePicUrl",
ADD COLUMN     "profilePicId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_profilePicId_key" ON "User"("profilePicId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_profilePicId_fkey" FOREIGN KEY ("profilePicId") REFERENCES "Media"("key") ON DELETE SET NULL ON UPDATE CASCADE;
