-- AlterTable
ALTER TABLE `User` ADD COLUMN `avatarUrl` VARCHAR(500) NULL,
    MODIFY `password` VARCHAR(255) NULL;
