-- AlterTable
ALTER TABLE "public"."ServicePackage" ADD COLUMN     "aboutVendor" TEXT,
ADD COLUMN     "availability" JSONB,
ADD COLUMN     "gallery" TEXT[],
ADD COLUMN     "location" TEXT,
ADD COLUMN     "mainImage" TEXT,
ADD COLUMN     "state" TEXT;

-- AlterTable
ALTER TABLE "public"."VendorProfile" ADD COLUMN     "billingDetails" JSONB,
ADD COLUMN     "businessProof" TEXT;
