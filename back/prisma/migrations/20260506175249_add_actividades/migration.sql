-- CreateTable
CREATE TABLE `CategoriaActividad` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `color` VARCHAR(20) NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `CategoriaActividad_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Actividad` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `coverImage` LONGTEXT NULL,
    `categoryId` INTEGER NULL,
    `contentJson` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Actividad` ADD CONSTRAINT `Actividad_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `CategoriaActividad`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
