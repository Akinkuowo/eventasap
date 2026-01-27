/*
  Warnings:

  - You are about to drop the column `depositAmount` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `guestCount` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `packageId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `specialRequests` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `Booking` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[proposalId]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `budget` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceType` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Made the column `firstName` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastName` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phoneNumber` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."ServiceRequestStatus" AS ENUM ('ACTIVE', 'FULFILLED', 'CLOSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."ServiceRequestUrgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "public"."ProposalStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- AlterEnum
ALTER TYPE "public"."PaymentStatus" ADD VALUE 'PARTIAL';

-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_clientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_packageId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_clientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_vendorId_fkey";

-- AlterTable
ALTER TABLE "public"."Booking" DROP COLUMN "depositAmount",
DROP COLUMN "guestCount",
DROP COLUMN "packageId",
DROP COLUMN "specialRequests",
DROP COLUMN "totalAmount",
ADD COLUMN     "bookingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "budget" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "clientProfileId" TEXT,
ADD COLUMN     "commissionAmount" DOUBLE PRECISION,
ADD COLUMN     "customRequirements" TEXT[],
ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "guests" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "message" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "proposalId" TEXT,
ADD COLUMN     "quotedPrice" DOUBLE PRECISION,
ADD COLUMN     "serviceId" TEXT,
ADD COLUMN     "serviceRequestId" TEXT,
ADD COLUMN     "serviceType" TEXT NOT NULL,
ADD COLUMN     "startTime" TIMESTAMP(3),
ADD COLUMN     "vendorProfileId" TEXT;

-- AlterTable
ALTER TABLE "public"."ClientProfile" ADD COLUMN     "preferences" JSONB,
ADD COLUMN     "state" TEXT;

-- AlterTable
ALTER TABLE "public"."Notification" ADD COLUMN     "actionUrl" TEXT,
ADD COLUMN     "isSeen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "readAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Review" ADD COLUMN     "clientProfileId" TEXT,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "response" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "vendorProfileId" TEXT,
ALTER COLUMN "rating" SET DEFAULT 5;

-- AlterTable
ALTER TABLE "public"."ServicePackage" ADD COLUMN     "maxBooking" INTEGER,
ADD COLUMN     "preparationTime" INTEGER DEFAULT 1;

-- AlterTable
ALTER TABLE "public"."SubscriptionPlan" ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "maxBookings" INTEGER DEFAULT 10,
ADD COLUMN     "maxListings" INTEGER DEFAULT 3,
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "lastName" SET NOT NULL,
ALTER COLUMN "phoneNumber" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."VendorProfile" ADD COLUMN     "availability" JSONB,
ADD COLUMN     "isOnline" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxBookingPrice" DOUBLE PRECISION,
ADD COLUMN     "minBookingPrice" DOUBLE PRECISION,
ADD COLUMN     "responseTime" INTEGER DEFAULT 24,
ADD COLUMN     "socialLinks" JSONB,
ADD COLUMN     "state" TEXT;

-- AlterTable
ALTER TABLE "public"."VendorSubscription" ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "trialEndsAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "paymentMethod" TEXT NOT NULL,
    "stripePaymentId" TEXT,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ServiceRequest" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientProfileId" TEXT,
    "serviceType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budgetMin" DOUBLE PRECISION NOT NULL,
    "budgetMax" DOUBLE PRECISION NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "eventLocation" TEXT NOT NULL,
    "guests" INTEGER NOT NULL DEFAULT 1,
    "requirements" TEXT[],
    "urgency" "public"."ServiceRequestUrgency" NOT NULL DEFAULT 'MEDIUM',
    "status" "public"."ServiceRequestStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiryDate" TIMESTAMP(3),
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Proposal" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "vendorProfileId" TEXT,
    "serviceRequestId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "message" TEXT NOT NULL,
    "inclusions" TEXT[],
    "exclusions" TEXT[],
    "deliveryTime" INTEGER,
    "revisions" INTEGER DEFAULT 1,
    "status" "public"."ProposalStatus" NOT NULL DEFAULT 'PENDING',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "conversationId" TEXT,
    "bookingId" TEXT,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "attachments" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Conversation" (
    "id" TEXT NOT NULL,
    "participant1Id" TEXT NOT NULL,
    "participant2Id" TEXT NOT NULL,
    "bookingId" TEXT,
    "lastMessageId" TEXT,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlatformAnalytics" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalUsers" INTEGER NOT NULL DEFAULT 0,
    "totalVendors" INTEGER NOT NULL DEFAULT 0,
    "totalBookings" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "newUsers" INTEGER NOT NULL DEFAULT 0,
    "newVendors" INTEGER NOT NULL DEFAULT 0,
    "completedBookings" INTEGER NOT NULL DEFAULT 0,
    "cancelledBookings" INTEGER NOT NULL DEFAULT 0,
    "avgRating" DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Payment_bookingId_idx" ON "public"."Payment"("bookingId");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "public"."Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "public"."Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "public"."Payment"("createdAt");

-- CreateIndex
CREATE INDEX "ServiceRequest_clientId_idx" ON "public"."ServiceRequest"("clientId");

-- CreateIndex
CREATE INDEX "ServiceRequest_clientProfileId_idx" ON "public"."ServiceRequest"("clientProfileId");

-- CreateIndex
CREATE INDEX "ServiceRequest_serviceType_idx" ON "public"."ServiceRequest"("serviceType");

-- CreateIndex
CREATE INDEX "ServiceRequest_eventDate_idx" ON "public"."ServiceRequest"("eventDate");

-- CreateIndex
CREATE INDEX "ServiceRequest_status_idx" ON "public"."ServiceRequest"("status");

-- CreateIndex
CREATE INDEX "ServiceRequest_urgency_idx" ON "public"."ServiceRequest"("urgency");

-- CreateIndex
CREATE INDEX "ServiceRequest_createdAt_idx" ON "public"."ServiceRequest"("createdAt");

-- CreateIndex
CREATE INDEX "ServiceRequest_isPublic_idx" ON "public"."ServiceRequest"("isPublic");

-- CreateIndex
CREATE INDEX "Proposal_vendorId_idx" ON "public"."Proposal"("vendorId");

-- CreateIndex
CREATE INDEX "Proposal_vendorProfileId_idx" ON "public"."Proposal"("vendorProfileId");

-- CreateIndex
CREATE INDEX "Proposal_serviceRequestId_idx" ON "public"."Proposal"("serviceRequestId");

-- CreateIndex
CREATE INDEX "Proposal_status_idx" ON "public"."Proposal"("status");

-- CreateIndex
CREATE INDEX "Proposal_price_idx" ON "public"."Proposal"("price");

-- CreateIndex
CREATE INDEX "Proposal_createdAt_idx" ON "public"."Proposal"("createdAt");

-- CreateIndex
CREATE INDEX "Proposal_expiresAt_idx" ON "public"."Proposal"("expiresAt");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "public"."Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_receiverId_idx" ON "public"."Message"("receiverId");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "public"."Message"("conversationId");

-- CreateIndex
CREATE INDEX "Message_bookingId_idx" ON "public"."Message"("bookingId");

-- CreateIndex
CREATE INDEX "Message_isRead_idx" ON "public"."Message"("isRead");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "public"."Message"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_lastMessageId_key" ON "public"."Conversation"("lastMessageId");

-- CreateIndex
CREATE INDEX "Conversation_participant1Id_idx" ON "public"."Conversation"("participant1Id");

-- CreateIndex
CREATE INDEX "Conversation_participant2Id_idx" ON "public"."Conversation"("participant2Id");

-- CreateIndex
CREATE INDEX "Conversation_lastActivityAt_idx" ON "public"."Conversation"("lastActivityAt");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_participant1Id_participant2Id_bookingId_key" ON "public"."Conversation"("participant1Id", "participant2Id", "bookingId");

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "public"."Favorite"("userId");

-- CreateIndex
CREATE INDEX "Favorite_vendorId_idx" ON "public"."Favorite"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_vendorId_key" ON "public"."Favorite"("userId", "vendorId");

-- CreateIndex
CREATE INDEX "Report_reporterId_idx" ON "public"."Report"("reporterId");

-- CreateIndex
CREATE INDEX "Report_targetId_idx" ON "public"."Report"("targetId");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "public"."Report"("status");

-- CreateIndex
CREATE INDEX "Report_createdAt_idx" ON "public"."Report"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformAnalytics_date_key" ON "public"."PlatformAnalytics"("date");

-- CreateIndex
CREATE INDEX "PlatformAnalytics_date_idx" ON "public"."PlatformAnalytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_proposalId_key" ON "public"."Booking"("proposalId");

-- CreateIndex
CREATE INDEX "Booking_vendorProfileId_idx" ON "public"."Booking"("vendorProfileId");

-- CreateIndex
CREATE INDEX "Booking_clientProfileId_idx" ON "public"."Booking"("clientProfileId");

-- CreateIndex
CREATE INDEX "Booking_bookingDate_idx" ON "public"."Booking"("bookingDate");

-- CreateIndex
CREATE INDEX "Booking_serviceRequestId_idx" ON "public"."Booking"("serviceRequestId");

-- CreateIndex
CREATE INDEX "Review_vendorProfileId_idx" ON "public"."Review"("vendorProfileId");

-- CreateIndex
CREATE INDEX "Review_clientProfileId_idx" ON "public"."Review"("clientProfileId");

-- CreateIndex
CREATE INDEX "Review_isPublic_idx" ON "public"."Review"("isPublic");

-- CreateIndex
CREATE INDEX "ServicePackage_isActive_idx" ON "public"."ServicePackage"("isActive");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_price_idx" ON "public"."SubscriptionPlan"("price");

-- CreateIndex
CREATE INDEX "VendorProfile_rating_idx" ON "public"."VendorProfile"("rating");

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "public"."VendorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "public"."ClientProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."ServicePackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "public"."ServiceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "public"."Proposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceRequest" ADD CONSTRAINT "ServiceRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceRequest" ADD CONSTRAINT "ServiceRequest_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "public"."ClientProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Proposal" ADD CONSTRAINT "Proposal_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Proposal" ADD CONSTRAINT "Proposal_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "public"."VendorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Proposal" ADD CONSTRAINT "Proposal_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "public"."ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "public"."ClientProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "public"."VendorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_participant1Id_fkey" FOREIGN KEY ("participant1Id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_participant2Id_fkey" FOREIGN KEY ("participant2Id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_lastMessageId_fkey" FOREIGN KEY ("lastMessageId") REFERENCES "public"."Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Favorite" ADD CONSTRAINT "Favorite_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
