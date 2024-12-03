/*
  Warnings:

  - Added the required column `category` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MediaCategory" AS ENUM ('WORKOUT', 'POST');

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "category" "MediaCategory" NOT NULL;
