-- AlterTable
ALTER TABLE `jobs` ADD COLUMN `additional_qualifications` JSON NULL,
    ADD COLUMN `contact_name` VARCHAR(191) NULL,
    ADD COLUMN `contact_phone` VARCHAR(191) NULL,
    ADD COLUMN `qualification_age_max` INTEGER NULL,
    ADD COLUMN `qualification_age_min` INTEGER NULL,
    ADD COLUMN `qualification_experience` INTEGER NULL,
    ADD COLUMN `qualification_gender` VARCHAR(191) NULL,
    ADD COLUMN `transportation` JSON NULL;

-- AlterTable
ALTER TABLE `language_tests` ADD COLUMN `file_url` VARCHAR(191) NULL;
