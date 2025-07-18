/*
  Warnings:

  - You are about to drop the column `photos` on the `apartments` table. All the data in the column will be lost.
  - You are about to drop the column `sources` on the `apartments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "apartments" DROP COLUMN "photos",
DROP COLUMN "sources";
