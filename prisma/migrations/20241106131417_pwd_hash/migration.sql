/*
  Warnings:

  - You are about to drop the `UserInvitation` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `pwHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserInvitation" DROP CONSTRAINT "UserInvitation_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pwHash" TEXT NOT NULL;

-- DropTable
DROP TABLE "UserInvitation";
