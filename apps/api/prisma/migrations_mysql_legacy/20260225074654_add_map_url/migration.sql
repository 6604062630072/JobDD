/*
  Warnings:

  - You are about to alter the column `benefits` on the `jobs` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Json`.

*/
-- AlterTable
ALTER TABLE `applications` ADD COLUMN `interview_date` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `jobs` ADD COLUMN `can_online_interview` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `end_time` VARCHAR(191) NULL,
    ADD COLUMN `map_url` TEXT NULL,
    ADD COLUMN `positions` INTEGER NULL DEFAULT 1,
    ADD COLUMN `start_time` VARCHAR(191) NULL,
    ADD COLUMN `view_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `welcome_recent_grads` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `working_days` VARCHAR(191) NULL,
    MODIFY `benefits` JSON NULL;
