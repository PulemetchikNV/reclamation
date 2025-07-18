/*
  Warnings:

  - You are about to drop the column `group_id` on the `scenarios` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `scenarios` table. All the data in the column will be lost.
  - Made the column `description` on table `scenarios` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "scenarios" DROP CONSTRAINT "scenarios_group_id_fkey";

-- AlterTable
ALTER TABLE "counterparties" ADD COLUMN     "context_file_path" TEXT;

-- AlterTable
ALTER TABLE "scenarios" DROP COLUMN "group_id",
DROP COLUMN "metadata",
ADD COLUMN     "scenario_group_id" TEXT,
ALTER COLUMN "description" SET NOT NULL;

-- CreateTable
CREATE TABLE "_CounterpartyToScenario" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CounterpartyToScenario_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CounterpartyToScenario_B_index" ON "_CounterpartyToScenario"("B");

-- AddForeignKey
ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_scenario_group_id_fkey" FOREIGN KEY ("scenario_group_id") REFERENCES "scenario_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CounterpartyToScenario" ADD CONSTRAINT "_CounterpartyToScenario_A_fkey" FOREIGN KEY ("A") REFERENCES "counterparties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CounterpartyToScenario" ADD CONSTRAINT "_CounterpartyToScenario_B_fkey" FOREIGN KEY ("B") REFERENCES "scenarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
