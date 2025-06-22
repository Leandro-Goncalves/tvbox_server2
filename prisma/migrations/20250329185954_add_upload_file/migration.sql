-- CreateTable
CREATE TABLE `user` (
    `guid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `isBlocked` BOOLEAN NULL DEFAULT false,
    `expirationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastLogin` DATETIME(3) NULL,
    `shouldRestart` BOOLEAN NULL DEFAULT false,

    UNIQUE INDEX `user_name_key`(`name`),
    PRIMARY KEY (`guid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `apps` (
    `guid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`guid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `downloadApp` (
    `guid` VARCHAR(191) NOT NULL,
    `isDownloaded` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`guid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `userApp` (
    `guid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `startAt` DATETIME(3) NOT NULL,
    `userGuid` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `userApp_userGuid_key`(`userGuid`),
    PRIMARY KEY (`guid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `userApp` ADD CONSTRAINT `userApp_userGuid_fkey` FOREIGN KEY (`userGuid`) REFERENCES `user`(`guid`) ON DELETE CASCADE ON UPDATE CASCADE;
