ALTER TABLE `defiRecord` ADD `recordKey` text;--> statement-breakpoint
UPDATE `defiRecord` SET `recordKey` = CASE WHEN `chainId` LIKE 'liquid:%' THEN lower(trim(`hash`)) ELSE lower(trim(`hash`)) || ':' || lower(trim(`fromAddress`)) || ':' || lower(trim(`toAddress`)) END WHERE `recordKey` IS NULL OR trim(`recordKey`) = '';--> statement-breakpoint
DELETE FROM `defiRecord` WHERE `recordKey` IS NULL OR trim(`recordKey`) = '';--> statement-breakpoint
DELETE FROM `defiRecord` WHERE `id` NOT IN (SELECT MAX(`id`) FROM `defiRecord` GROUP BY `userAddress`, `chainId`, `recordKey`);--> statement-breakpoint
CREATE UNIQUE INDEX `defi_record_user_chain_record_key_idx` ON `defiRecord` (`userAddress`,`chainId`,`recordKey`);--> statement-breakpoint
CREATE INDEX `defi_record_user_chain_time_idx` ON `defiRecord` (`userAddress`,`chainId`,`timeStamp`);--> statement-breakpoint
CREATE INDEX `defi_record_user_chain_status_idx` ON `defiRecord` (`userAddress`,`chainId`,`status`);