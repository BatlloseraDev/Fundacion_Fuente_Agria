ALTER TABLE `Cart` ADD COLUMN `lastActivityAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

UPDATE `Cart` SET `lastActivityAt` = `updatedAt`;

CREATE INDEX `Cart_status_lastActivityAt_idx` ON `Cart`(`status`, `lastActivityAt`);
