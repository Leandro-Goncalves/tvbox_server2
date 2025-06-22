/*
  Warnings:

  - Added the required column `appGuid` to the `downloadApp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userGuid` to the `downloadApp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `downloadApp` ADD COLUMN `appGuid` VARCHAR(191) NOT NULL,
    ADD COLUMN `userGuid` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `downloadApp` ADD CONSTRAINT `downloadApp_appGuid_fkey` FOREIGN KEY (`appGuid`) REFERENCES `apps`(`guid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `downloadApp` ADD CONSTRAINT `downloadApp_userGuid_fkey` FOREIGN KEY (`userGuid`) REFERENCES `user`(`guid`) ON DELETE RESTRICT ON UPDATE CASCADE;
