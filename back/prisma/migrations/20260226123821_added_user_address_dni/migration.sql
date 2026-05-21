/*
  Warnings:

  - A unique constraint covering the columns `[dni]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `address` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `address` VARCHAR(150) NOT NULL,
    ADD COLUMN `dni` VARCHAR(9) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_dni_key` ON `User`(`dni`);
