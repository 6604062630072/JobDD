/*
  Warnings:

  - You are about to alter the column `graduation_year` on the `educations` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `gpa` on the `educations` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Double`.

*/
-- AlterTable
ALTER TABLE `companies` ADD COLUMN `address` VARCHAR(191) NULL,
    ADD COLUMN `company_type` VARCHAR(191) NULL,
    ADD COLUMN `district` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `province` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `educations` MODIFY `graduation_year` INTEGER NULL,
    MODIFY `gpa` DOUBLE NULL;

-- AlterTable
ALTER TABLE `user_languages` ADD COLUMN `reading` VARCHAR(191) NULL,
    ADD COLUMN `speaking` VARCHAR(191) NULL,
    ADD COLUMN `writing` VARCHAR(191) NULL;
