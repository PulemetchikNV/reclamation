-- AlterTable
ALTER TABLE "chats" ADD COLUMN     "isFinished" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "chat_analyses" (
    "id" TEXT NOT NULL,
    "goodSides" TEXT[],
    "badSides" TEXT[],
    "rating" INTEGER NOT NULL,
    "chat_id" TEXT NOT NULL,

    CONSTRAINT "chat_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chat_analyses_chat_id_key" ON "chat_analyses"("chat_id");

-- AddForeignKey
ALTER TABLE "chat_analyses" ADD CONSTRAINT "chat_analyses_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
