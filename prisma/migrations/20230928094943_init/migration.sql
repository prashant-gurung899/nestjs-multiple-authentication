-- CreateTable
CREATE TABLE "refreshToken" (
    "id" SERIAL NOT NULL,
    "token_hash" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "refreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refreshToken_userId_key" ON "refreshToken"("userId");

-- AddForeignKey
ALTER TABLE "refreshToken" ADD CONSTRAINT "refreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
