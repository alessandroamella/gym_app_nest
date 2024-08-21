/*
  Warnings:

  - You are about to drop the column `workoutId` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the `UserWorkout` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_workoutId_fkey";

-- DropForeignKey
ALTER TABLE "UserWorkout" DROP CONSTRAINT "UserWorkout_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserWorkout" DROP CONSTRAINT "UserWorkout_workoutId_fkey";

-- AlterTable
ALTER TABLE "Media" DROP COLUMN "workoutId",
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Workout" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "UserWorkout";

-- CreateTable
CREATE TABLE "_WorkoutMedia" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_WorkoutMedia_AB_unique" ON "_WorkoutMedia"("A", "B");

-- CreateIndex
CREATE INDEX "_WorkoutMedia_B_index" ON "_WorkoutMedia"("B");

-- AddForeignKey
ALTER TABLE "_WorkoutMedia" ADD CONSTRAINT "_WorkoutMedia_A_fkey" FOREIGN KEY ("A") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WorkoutMedia" ADD CONSTRAINT "_WorkoutMedia_B_fkey" FOREIGN KEY ("B") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;
