/*
  Warnings:

  - A unique constraint covering the columns `[codeforcesId]` on the table `CodeforcesAccount` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `codeforcesId` to the `CodeforcesAccount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CodeforcesAccount" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "codeforcesId" TEXT NOT NULL,
ADD COLUMN     "rating" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "CodeforcesAccount_codeforcesId_key" ON "CodeforcesAccount"("codeforcesId");
