/*
  Warnings:

  - You are about to drop the column `birthdate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `fiscalCode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profilePicId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Workout` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Workout` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Workout` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Workout` table. All the data in the column will be lost.
  - You are about to drop the `Media` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserWorkout` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `durationMin` to the `Workout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Workout` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_workoutId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_profilePicId_fkey";

-- DropForeignKey
ALTER TABLE "_UserWorkout" DROP CONSTRAINT "_UserWorkout_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserWorkout" DROP CONSTRAINT "_UserWorkout_B_fkey";

-- DropIndex
DROP INDEX "User_fiscalCode_key";

-- DropIndex
DROP INDEX "User_profilePicId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "birthdate",
DROP COLUMN "deletedAt",
DROP COLUMN "fiscalCode",
DROP COLUMN "gender",
DROP COLUMN "profilePicId",
DROP COLUMN "role",
ADD COLUMN     "profilePic" TEXT;

-- AlterTable
ALTER TABLE "Workout" DROP COLUMN "deletedAt",
DROP COLUMN "endTime",
DROP COLUMN "startTime",
DROP COLUMN "type",
ADD COLUMN     "durationMin" INTEGER NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Media";

-- DropTable
DROP TABLE "_UserWorkout";

-- DropEnum
DROP TYPE "Gender";

-- DropEnum
DROP TYPE "MediaCategory";

-- DropEnum
DROP TYPE "MediaType";

-- DropEnum
DROP TYPE "UserRole";

-- DropEnum
DROP TYPE "WorkoutType";

-- CreateTable
CREATE TABLE "UserInvitation" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutMedia" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "workoutId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserInvitation_userId_key" ON "UserInvitation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserInvitation_code_key" ON "UserInvitation"("code");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutMedia_url_key" ON "WorkoutMedia"("url");

-- CreateIndex
CREATE INDEX "WorkoutMedia_workoutId_idx" ON "WorkoutMedia"("workoutId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "Workout_userId_createdAt_idx" ON "Workout"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "UserInvitation" ADD CONSTRAINT "UserInvitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutMedia" ADD CONSTRAINT "WorkoutMedia_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
