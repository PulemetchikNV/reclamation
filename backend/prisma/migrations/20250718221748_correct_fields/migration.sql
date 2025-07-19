/*
  Warnings:

  - You are about to drop the column `scenario_group_id` on the `scenarios` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "scenarios" DROP CONSTRAINT "scenarios_scenario_group_id_fkey";

-- AlterTable
ALTER TABLE "scenarios" DROP COLUMN "scenario_group_id",
ADD COLUMN     "group_id" TEXT;

-- AddForeignKey
ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "scenario_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
