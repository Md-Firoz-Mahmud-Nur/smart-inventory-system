/*
  Warnings:

  - You are about to drop the column `appointmentId` on the `activity_logs` table. All the data in the column will be lost.
  - You are about to drop the column `customerName` on the `activity_logs` table. All the data in the column will be lost.
  - You are about to drop the column `staffName` on the `activity_logs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "activity_logs" DROP COLUMN "appointmentId",
DROP COLUMN "customerName",
DROP COLUMN "staffName",
ADD COLUMN     "orderId" TEXT,
ADD COLUMN     "productId" TEXT;
