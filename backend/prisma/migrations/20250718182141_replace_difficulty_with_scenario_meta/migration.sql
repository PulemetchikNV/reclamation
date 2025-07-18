/*
  Warnings:

  - You are about to drop the column `difficulty_meta` on the `scenarios` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "scenarios" DROP COLUMN "difficulty_meta",
ADD COLUMN     "scenario_meta" JSONB;
