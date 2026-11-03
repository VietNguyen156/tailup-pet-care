CREATE TABLE `ServiceImage` (
  `serviceId` VARCHAR(191) NOT NULL,
  `data` MEDIUMBLOB NOT NULL,
  `contentType` VARCHAR(30) NOT NULL,
  PRIMARY KEY (`serviceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `ServiceImage` ADD CONSTRAINT `ServiceImage_serviceId_fkey`
  FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
