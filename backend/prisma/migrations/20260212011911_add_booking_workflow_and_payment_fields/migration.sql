-- CreateEnum
CREATE TYPE "public"."ApprovalStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."PayoutStatus" AS ENUM ('HELD', 'RELEASED_TO_VENDOR', 'COMPLETED');

-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "adjustedPrice" DOUBLE PRECISION,
ADD COLUMN     "clientApprovalStatus" "public"."ApprovalStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
ADD COLUMN     "priceAdjustmentReason" TEXT;

-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "adminFee" DOUBLE PRECISION,
ADD COLUMN     "payoutStatus" "public"."PayoutStatus" NOT NULL DEFAULT 'HELD',
ADD COLUMN     "paypalOrderId" TEXT,
ADD COLUMN     "paypalPaymentId" TEXT,
ADD COLUMN     "vendorPayout" DOUBLE PRECISION;
