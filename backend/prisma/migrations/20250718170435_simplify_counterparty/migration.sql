/*
  Warnings:

  - You are about to drop the column `difficulty` on the `counterparties` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `counterparties` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "counterparties" DROP COLUMN "difficulty",
DROP COLUMN "type";

-- DropEnum
DROP TYPE "CounterpartyType";

-- DropEnum
DROP TYPE "Difficulty";
