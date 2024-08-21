/*
  Warnings:

  - You are about to drop the column `telegramId` on the `User` table. All the data in the column will be lost.
  - Added the required column `birthProvince` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `birthdate` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `birthplace` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fiscalCode` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('M', 'F');

-- DropIndex
DROP INDEX "User_telegramId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "telegramId",
ADD COLUMN     "birthProvince" TEXT NOT NULL,
ADD COLUMN     "birthdate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "birthplace" TEXT NOT NULL,
ADD COLUMN     "fiscalCode" TEXT NOT NULL,
ADD COLUMN     "gender" "Gender" NOT NULL;
