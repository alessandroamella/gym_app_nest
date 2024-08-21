/*
  Warnings:

  - A unique constraint covering the columns `[fiscalCode]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `fiscalCode` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "fiscalCode" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_fiscalCode_key" ON "User"("fiscalCode");
