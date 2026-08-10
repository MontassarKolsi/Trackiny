-- CreateTable
CREATE TABLE "CodeforcesAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodeforcesAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CodeforcesAccount_userId_key" ON "CodeforcesAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CodeforcesAccount_handle_key" ON "CodeforcesAccount"("handle");

-- AddForeignKey
ALTER TABLE "CodeforcesAccount" ADD CONSTRAINT "CodeforcesAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
