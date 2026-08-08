/*
  Warnings:

  - A unique constraint covering the columns `[githubId]` on the table `GithubAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GithubAccount_githubId_key" ON "GithubAccount"("githubId");
