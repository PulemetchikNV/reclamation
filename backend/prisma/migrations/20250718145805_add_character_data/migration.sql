-- AlterTable
ALTER TABLE "counterparties" ADD COLUMN     "character_data" JSONB,
ALTER COLUMN "character" DROP NOT NULL,
ALTER COLUMN "goal" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;
