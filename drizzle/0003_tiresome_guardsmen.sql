ALTER TABLE `users_table` RENAME COLUMN `firstName` TO `nama_pengguna`;--> statement-breakpoint
ALTER TABLE `users_table` RENAME COLUMN `lastName` TO `no_telp`;--> statement-breakpoint
ALTER TABLE `users_table` MODIFY COLUMN `no_telp` varchar(14) NOT NULL;--> statement-breakpoint
ALTER TABLE `users_table` DROP COLUMN `noTelp`;