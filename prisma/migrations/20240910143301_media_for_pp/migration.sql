/*
  Warnings:

  - You are about to drop the column `profilePic` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `_WorkoutMedia` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[profilePicId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MediaCategory" AS ENUM ('PROFILE_PIC', 'WORKOUT');

-- DropForeignKey
ALTER TABLE "_WorkoutMedia" DROP CONSTRAINT "_WorkoutMedia_A_fkey";

-- DropForeignKey
ALTER TABLE "_WorkoutMedia" DROP CONSTRAINT "_WorkoutMedia_B_fkey";

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "category" "MediaCategory" NOT NULL,
ADD COLUMN     "workoutId" INTEGER;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "profilePic",
ADD COLUMN     "profilePicId" TEXT;

-- DropTable
DROP TABLE "_WorkoutMedia";

-- CreateIndex
CREATE UNIQUE INDEX "User_profilePicId_key" ON "User"("profilePicId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_profilePicId_fkey" FOREIGN KEY ("profilePicId") REFERENCES "Media"("key") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE SET NULL ON UPDATE CASCADE;
