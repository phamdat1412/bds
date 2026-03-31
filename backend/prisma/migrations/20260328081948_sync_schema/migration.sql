/*
  Warnings:

  - You are about to drop the column `createdAt` on the `news` table. All the data in the column will be lost.
  - You are about to drop the column `publishedAt` on the `news` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailMediaId` on the `news` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `news` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `news` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `news` DROP FOREIGN KEY `news_thumbnailMediaId_fkey`;

-- DropIndex
DROP INDEX `news_thumbnailMediaId_fkey` ON `news`;

-- AlterTable
ALTER TABLE `news` DROP COLUMN `createdAt`,
    DROP COLUMN `publishedAt`,
    DROP COLUMN `thumbnailMediaId`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `published_at` DATETIME(3) NULL,
    ADD COLUMN `thumbnail_media_id` BIGINT UNSIGNED NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- CreateTable
CREATE TABLE `lead_activities` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `lead_id` BIGINT UNSIGNED NOT NULL,
    `created_by_user_id` BIGINT UNSIGNED NOT NULL,
    `activity_type` VARCHAR(100) NOT NULL,
    `note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `news` ADD CONSTRAINT `news_thumbnail_media_id_fkey` FOREIGN KEY (`thumbnail_media_id`) REFERENCES `media_files`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_activities` ADD CONSTRAINT `lead_activities_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_activities` ADD CONSTRAINT `lead_activities_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
