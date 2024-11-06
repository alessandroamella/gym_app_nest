/*
  Warnings:

  - You are about to drop the column `profilePic` on the `User` table. All the data in the column will be lost.
  - The primary key for the `WorkoutMedia` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `WorkoutMedia` table. All the data in the column will be lost.
  - Added the required column `key` to the `WorkoutMedia` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "profilePic",
ADD COLUMN     "profilePicKey" TEXT,
ADD COLUMN     "profilePicUrl" TEXT;

-- AlterTable
ALTER TABLE "WorkoutMedia" DROP CONSTRAINT "WorkoutMedia_pkey",
DROP COLUMN "id",
ADD COLUMN     "key" TEXT NOT NULL,
ADD CONSTRAINT "WorkoutMedia_pkey" PRIMARY KEY ("key");
