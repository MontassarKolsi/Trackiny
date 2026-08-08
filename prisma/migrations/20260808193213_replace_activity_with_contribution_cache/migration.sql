/*
  Warnings:

  - You are about to drop the `Activity` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_userId_fkey";

-- DropTable
DROP TABLE "Activity";

-- CreateTable
CREATE TABLE "ContributionCache" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContributionCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContributionCache_userId_idx" ON "ContributionCache"("userId");

-- CreateIndex
CREATE INDEX "ContributionCache_platform_idx" ON "ContributionCache"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "ContributionCache_userId_platform_key" ON "ContributionCache"("userId", "platform");

-- AddForeignKey
ALTER TABLE "ContributionCache" ADD CONSTRAINT "ContributionCache_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
