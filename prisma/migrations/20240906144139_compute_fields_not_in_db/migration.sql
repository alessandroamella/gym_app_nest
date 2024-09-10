/*
  Warnings:

  - You are about to drop the column `birthProvince` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `birthdate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `birthplace` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "birthProvince",
DROP COLUMN "birthdate",
DROP COLUMN "birthplace",
DROP COLUMN "gender";
