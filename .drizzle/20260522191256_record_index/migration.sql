CREATE INDEX `defi_record_user_chain_time_idx` ON `defiRecord` (`userAddress`,`chainId`,`timeStamp`);--> statement-breakpoint
CREATE INDEX `defi_record_hash_idx` ON `defiRecord` (`hash`);--> statement-breakpoint
CREATE INDEX `defi_record_status_time_idx` ON `defiRecord` (`status`,`timeStamp`);