/*
  Warnings:

  - You are about to drop the column `session_id` on the `chats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chats" DROP COLUMN "session_id",
ADD COLUMN     "rag_session_id" TEXT;
