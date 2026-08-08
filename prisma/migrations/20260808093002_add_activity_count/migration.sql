/*
  Warnings:

  - A unique constraint covering the columns `[userId,platform,date,type]` on the table `Activity` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "count" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "Activity_userId_date_idx" ON "Activity"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_userId_platform_date_type_key" ON "Activity"("userId", "platform", "date", "type");
