ALTER TABLE `companies`
    ADD COLUMN `verification_status` ENUM('UNVERIFIED', 'PENDING_REVIEW', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'UNVERIFIED',
    ADD COLUMN `verification_docs` JSON NULL,
    ADD COLUMN `verified_at` DATETIME(3) NULL,
    ADD COLUMN `rejection_reason` TEXT NULL;
