CREATE TABLE IF NOT EXISTS `wallet` (
	`id` text PRIMARY KEY,
	`name` text,
	`evmAddress` text,
	`tronAddress` text,
	`liquidAmpId` text,
	`liquidSubaccountPointer` integer,
	`imageId` integer NOT NULL,
	`createTime` text NOT NULL,
	`isImport` integer,
	`chains` text NOT NULL,
	`blockNumbers` text NOT NULL
);
