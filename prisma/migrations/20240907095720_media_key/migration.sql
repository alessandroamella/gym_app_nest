/*
  Warnings:

  - The primary key for the `Media` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Media` table. All the data in the column will be lost.
  - Made the column `key` on table `Media` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "_WorkoutMedia" DROP CONSTRAINT "_WorkoutMedia_A_fkey";

-- DropIndex
DROP INDEX "Media_key_key";

-- AlterTable
ALTER TABLE "Media" DROP CONSTRAINT "Media_pkey",
DROP COLUMN "id",
ALTER COLUMN "key" SET NOT NULL,
ADD CONSTRAINT "Media_pkey" PRIMARY KEY ("key");

-- AlterTable
ALTER TABLE "_WorkoutMedia" ALTER COLUMN "A" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "_WorkoutMedia" ADD CONSTRAINT "_WorkoutMedia_A_fkey" FOREIGN KEY ("A") REFERENCES "Media"("key") ON DELETE CASCADE ON UPDATE CASCADE;
