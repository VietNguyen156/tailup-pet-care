CREATE TABLE `StoreGalleryImage` (
 `id` VARCHAR(191) NOT NULL,
 `storeId` VARCHAR(191) NOT NULL,
 `alt` VARCHAR(160) NOT NULL,
 `data` MEDIUMBLOB NOT NULL,
 `contentType` VARCHAR(30) NOT NULL,
 `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 PRIMARY KEY (`id`),
 INDEX `StoreGalleryImage_storeId_createdAt_idx` (`storeId`, `createdAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `StoreGalleryImage` ADD CONSTRAINT `StoreGalleryImage_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
