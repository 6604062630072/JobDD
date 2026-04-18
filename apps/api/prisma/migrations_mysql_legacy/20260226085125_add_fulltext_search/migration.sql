-- Add FULLTEXT index for job search (Thai + English)
ALTER TABLE `jobs` ADD FULLTEXT INDEX `ft_jobs_search` (`title`, `description`, `requirements`);