-- Preserve existing records in the initial TailUp store.
CREATE TABLE `Store` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `address` VARCHAR(500) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `Store_slug_key`(`slug`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
INSERT INTO `Store` (`id`,`name`,`slug`,`description`,`address`,`phone`,`updatedAt`)
VALUES ('store-tailup','TailUp','tailup','Chăm sóc cho người bạn nhỏ.','','',CURRENT_TIMESTAMP(3));
ALTER TABLE `User` ADD COLUMN `storeId` VARCHAR(191) NULL;
ALTER TABLE `User` MODIFY `role` ENUM('CUSTOMER','STAFF','ADMIN','STORE_ADMIN','SUPER_ADMIN') NOT NULL DEFAULT 'CUSTOMER';
UPDATE `User` SET `role`='STORE_ADMIN', `storeId`='store-tailup' WHERE `role`='STAFF';
UPDATE `User` SET `role`='SUPER_ADMIN' WHERE `role`='ADMIN';
ALTER TABLE `User` MODIFY `role` ENUM('CUSTOMER','STORE_ADMIN','SUPER_ADMIN') NOT NULL DEFAULT 'CUSTOMER';
CREATE INDEX `User_storeId_idx` ON `User`(`storeId`);
ALTER TABLE `User` ADD CONSTRAINT `User_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Service` ADD COLUMN `storeId` VARCHAR(191) NOT NULL DEFAULT 'store-tailup';
ALTER TABLE `Product` ADD COLUMN `storeId` VARCHAR(191) NOT NULL DEFAULT 'store-tailup';
ALTER TABLE `Booking` ADD COLUMN `storeId` VARCHAR(191) NOT NULL DEFAULT 'store-tailup';
ALTER TABLE `Order` ADD COLUMN `storeId` VARCHAR(191) NOT NULL DEFAULT 'store-tailup';
ALTER TABLE `AppointmentSlot` ADD COLUMN `storeId` VARCHAR(191) NOT NULL DEFAULT 'store-tailup';
ALTER TABLE `Service` ALTER COLUMN `storeId` DROP DEFAULT;
ALTER TABLE `Product` ALTER COLUMN `storeId` DROP DEFAULT;
ALTER TABLE `Booking` ALTER COLUMN `storeId` DROP DEFAULT;
ALTER TABLE `Order` ALTER COLUMN `storeId` DROP DEFAULT;
ALTER TABLE `AppointmentSlot` ALTER COLUMN `storeId` DROP DEFAULT;
CREATE INDEX `Service_storeId_idx` ON `Service`(`storeId`);
CREATE INDEX `Product_storeId_idx` ON `Product`(`storeId`);
CREATE INDEX `Booking_storeId_idx` ON `Booking`(`storeId`);
CREATE INDEX `Order_storeId_idx` ON `Order`(`storeId`);
CREATE INDEX `AppointmentSlot_storeId_idx` ON `AppointmentSlot`(`storeId`);
DROP INDEX `AppointmentSlot_bookingDate_timeSlot_key` ON `AppointmentSlot`;
CREATE UNIQUE INDEX `AppointmentSlot_storeId_bookingDate_timeSlot_key` ON `AppointmentSlot`(`storeId`,`bookingDate`,`timeSlot`);
ALTER TABLE `Service` ADD CONSTRAINT `Service_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Product` ADD CONSTRAINT `Product_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Order` ADD CONSTRAINT `Order_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `AppointmentSlot` ADD CONSTRAINT `AppointmentSlot_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
