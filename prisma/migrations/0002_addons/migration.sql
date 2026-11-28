-- AlterTable
ALTER TABLE "RescueCase" ADD COLUMN "audioUrl" TEXT,
ADD COLUMN "latitude" DOUBLE PRECISION,
ADD COLUMN "longitude" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "MedicalFundraiser" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "animalName" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "goalInr" DOUBLE PRECISION NOT NULL,
    "purpose" TEXT NOT NULL DEFAULT 'Medical Treatment',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "animalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalFundraiser_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Donation" ADD COLUMN "fundraiserId" TEXT;

-- CreateTable
CREATE TABLE "CommunityDrive" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "driveType" TEXT NOT NULL,
    "areaWard" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "coordinator" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Scheduled',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityDrive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryPhoto" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "caption" TEXT,
    "imageUrl" TEXT NOT NULL,
    "capturedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GalleryPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Donation_fundraiserId_idx" ON "Donation"("fundraiserId");

-- CreateIndex
CREATE INDEX "MedicalFundraiser_isActive_idx" ON "MedicalFundraiser"("isActive");

-- CreateIndex
CREATE INDEX "MedicalFundraiser_createdAt_idx" ON "MedicalFundraiser"("createdAt");

-- CreateIndex
CREATE INDEX "CommunityDrive_date_idx" ON "CommunityDrive"("date");

-- CreateIndex
CREATE INDEX "CommunityDrive_status_idx" ON "CommunityDrive"("status");

-- CreateIndex
CREATE INDEX "GalleryPhoto_category_idx" ON "GalleryPhoto"("category");

-- CreateIndex
CREATE INDEX "GalleryPhoto_capturedDate_idx" ON "GalleryPhoto"("capturedDate");

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_fundraiserId_fkey" FOREIGN KEY ("fundraiserId") REFERENCES "MedicalFundraiser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalFundraiser" ADD CONSTRAINT "MedicalFundraiser_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
