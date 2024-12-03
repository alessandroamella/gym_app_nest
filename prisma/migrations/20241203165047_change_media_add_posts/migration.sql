/*
  Warnings:

  - You are about to drop the `WorkoutMedia` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "WorkoutMedia" DROP CONSTRAINT "WorkoutMedia_workoutId_fkey";

-- DropTable
DROP TABLE "WorkoutMedia";

-- CreateTable
CREATE TABLE "Media" (
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "workoutId" INTEGER,
    "postId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "MotivationPost" (
    "id" SERIAL NOT NULL,
    "text" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MotivationPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Media_url_key" ON "Media"("url");

-- CreateIndex
CREATE INDEX "Media_workoutId_idx" ON "Media"("workoutId");

-- CreateIndex
CREATE INDEX "MotivationPost_userId_createdAt_idx" ON "MotivationPost"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_postId_fkey" FOREIGN KEY ("postId") REFERENCES "MotivationPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MotivationPost" ADD CONSTRAINT "MotivationPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
