-- AlterTable
ALTER TABLE `jobs` ADD COLUMN `company_address` TEXT NULL,
    MODIFY `location_province` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `jobs_company_address_idx` ON `jobs`(`company_address`(50));
