ALTER TABLE `Review`
    DROP FOREIGN KEY `Review_serviceId_fkey`,
    DROP FOREIGN KEY `Review_productId_fkey`,
    ADD CONSTRAINT `Review_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
    ADD CONSTRAINT `Review_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `Review` ADD CONSTRAINT `Review_one_target` CHECK ((`serviceId` IS NULL) <> (`productId` IS NULL));
ALTER TABLE `Review` ADD CONSTRAINT `Review_rating_range` CHECK (`rating` BETWEEN 1 AND 5);
ALTER TABLE `Product` ADD CONSTRAINT `Product_stock_nonnegative` CHECK (`stock` >= 0);
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_quantity_positive` CHECK (`quantity` > 0);
ALTER TABLE `Service` ADD CONSTRAINT `Service_duration_positive` CHECK (`durationMinutes` > 0);
