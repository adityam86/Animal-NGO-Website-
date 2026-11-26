-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL,
    "jti" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactInquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'New',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Animal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "breed" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "age" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "vaccinated" BOOLEAN NOT NULL DEFAULT false,
    "dewormed" BOOLEAN NOT NULL DEFAULT false,
    "sterilized" BOOLEAN NOT NULL DEFAULT false,
    "rescueDate" TIMESTAMP(3) NOT NULL,
    "shelter" TEXT NOT NULL,
    "story" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "shelterLocationId" TEXT,

    CONSTRAINT "Animal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RescueCase" (
    "id" TEXT NOT NULL,
    "animalType" TEXT NOT NULL,
    "emergencyLevel" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "reporterName" TEXT NOT NULL,
    "reporterPhone" TEXT NOT NULL,
    "reporterEmail" TEXT,
    "photoUrl" TEXT,
    "assignedTeam" TEXT,
    "status" TEXT NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RescueCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RescueCaseStatus" (
    "id" TEXT NOT NULL,
    "rescueCaseId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "time" TEXT,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RescueCaseStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Story" (
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "animal" TEXT NOT NULL,
    "animalType" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "readTime" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "StoryPhase" (
    "id" TEXT NOT NULL,
    "storySlug" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryPhase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Volunteer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "location" TEXT,
    "experience" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Volunteer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerRole" (
    "id" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "VolunteerRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerAvailability" (
    "id" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "availability" TEXT NOT NULL,

    CONSTRAINT "VolunteerAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "purpose" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "donorName" TEXT NOT NULL,
    "donorPhone" TEXT NOT NULL,
    "donorEmail" TEXT NOT NULL,
    "donorPan" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'Pending',
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdoptionApplication" (
    "id" TEXT NOT NULL,
    "applicantName" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "occupation" TEXT NOT NULL,
    "hasPets" BOOLEAN NOT NULL,
    "petDetails" TEXT,
    "homeType" TEXT NOT NULL,
    "familyMembers" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "animalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdoptionApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sponsorship" (
    "id" TEXT NOT NULL,
    "sponsorName" TEXT NOT NULL,
    "sponsorPhone" TEXT NOT NULL,
    "sponsorEmail" TEXT NOT NULL,
    "animalId" TEXT,
    "tier" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "frequency" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'Pending',
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sponsorship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalRecord" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "treatment" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vetName" TEXT NOT NULL,
    "notes" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vaccination" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "vaccineName" TEXT NOT NULL,
    "dateAdministered" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDue" TIMESTAMP(3),
    "vetName" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vaccination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShelterLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShelterLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_jti_key" ON "AdminSession"("jti");

-- CreateIndex
CREATE INDEX "AdminSession_userId_idx" ON "AdminSession"("userId");

-- CreateIndex
CREATE INDEX "AdminSession_expiresAt_idx" ON "AdminSession"("expiresAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "ContactInquiry_status_idx" ON "ContactInquiry"("status");

-- CreateIndex
CREATE INDEX "ContactInquiry_createdAt_idx" ON "ContactInquiry"("createdAt");

-- CreateIndex
CREATE INDEX "Animal_status_idx" ON "Animal"("status");

-- CreateIndex
CREATE INDEX "Animal_type_idx" ON "Animal"("type");

-- CreateIndex
CREATE INDEX "Animal_shelterLocationId_idx" ON "Animal"("shelterLocationId");

-- CreateIndex
CREATE INDEX "Animal_createdAt_idx" ON "Animal"("createdAt");

-- CreateIndex
CREATE INDEX "RescueCase_status_idx" ON "RescueCase"("status");

-- CreateIndex
CREATE INDEX "RescueCase_emergencyLevel_idx" ON "RescueCase"("emergencyLevel");

-- CreateIndex
CREATE INDEX "RescueCase_reportedAt_idx" ON "RescueCase"("reportedAt");

-- CreateIndex
CREATE INDEX "RescueCaseStatus_rescueCaseId_idx" ON "RescueCaseStatus"("rescueCaseId");

-- CreateIndex
CREATE INDEX "Story_date_idx" ON "Story"("date");

-- CreateIndex
CREATE INDEX "StoryPhase_storySlug_idx" ON "StoryPhase"("storySlug");

-- CreateIndex
CREATE INDEX "Volunteer_status_idx" ON "Volunteer"("status");

-- CreateIndex
CREATE INDEX "Volunteer_email_idx" ON "Volunteer"("email");

-- CreateIndex
CREATE INDEX "Volunteer_createdAt_idx" ON "Volunteer"("createdAt");

-- CreateIndex
CREATE INDEX "VolunteerRole_volunteerId_idx" ON "VolunteerRole"("volunteerId");

-- CreateIndex
CREATE INDEX "VolunteerAvailability_volunteerId_idx" ON "VolunteerAvailability"("volunteerId");

-- CreateIndex
CREATE UNIQUE INDEX "Donation_razorpayOrderId_key" ON "Donation"("razorpayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Donation_razorpayPaymentId_key" ON "Donation"("razorpayPaymentId");

-- CreateIndex
CREATE INDEX "Donation_paymentStatus_idx" ON "Donation"("paymentStatus");

-- CreateIndex
CREATE INDEX "Donation_purpose_idx" ON "Donation"("purpose");

-- CreateIndex
CREATE INDEX "Donation_createdAt_idx" ON "Donation"("createdAt");

-- CreateIndex
CREATE INDEX "AdoptionApplication_status_idx" ON "AdoptionApplication"("status");

-- CreateIndex
CREATE INDEX "AdoptionApplication_animalId_idx" ON "AdoptionApplication"("animalId");

-- CreateIndex
CREATE INDEX "AdoptionApplication_createdAt_idx" ON "AdoptionApplication"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Sponsorship_razorpayOrderId_key" ON "Sponsorship"("razorpayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Sponsorship_razorpayPaymentId_key" ON "Sponsorship"("razorpayPaymentId");

-- CreateIndex
CREATE INDEX "Sponsorship_paymentStatus_idx" ON "Sponsorship"("paymentStatus");

-- CreateIndex
CREATE INDEX "Sponsorship_animalId_idx" ON "Sponsorship"("animalId");

-- CreateIndex
CREATE INDEX "Sponsorship_createdAt_idx" ON "Sponsorship"("createdAt");

-- CreateIndex
CREATE INDEX "MedicalRecord_animalId_idx" ON "MedicalRecord"("animalId");

-- CreateIndex
CREATE INDEX "MedicalRecord_date_idx" ON "MedicalRecord"("date");

-- CreateIndex
CREATE INDEX "Vaccination_animalId_idx" ON "Vaccination"("animalId");

-- CreateIndex
CREATE INDEX "Vaccination_dateDue_idx" ON "Vaccination"("dateDue");

-- CreateIndex
CREATE INDEX "ShelterLocation_type_idx" ON "ShelterLocation"("type");

-- AddForeignKey
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_shelterLocationId_fkey" FOREIGN KEY ("shelterLocationId") REFERENCES "ShelterLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RescueCaseStatus" ADD CONSTRAINT "RescueCaseStatus_rescueCaseId_fkey" FOREIGN KEY ("rescueCaseId") REFERENCES "RescueCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryPhase" ADD CONSTRAINT "StoryPhase_storySlug_fkey" FOREIGN KEY ("storySlug") REFERENCES "Story"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerRole" ADD CONSTRAINT "VolunteerRole_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerAvailability" ADD CONSTRAINT "VolunteerAvailability_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdoptionApplication" ADD CONSTRAINT "AdoptionApplication_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sponsorship" ADD CONSTRAINT "Sponsorship_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vaccination" ADD CONSTRAINT "Vaccination_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

