/*
  Warnings:

  - You are about to drop the column `messages` on the `ai_chats` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ai_chats` table. All the data in the column will be lost.
  - Added the required column `prompt` to the `ai_chats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `response` to the `ai_chats` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ai_chats" DROP COLUMN "messages",
DROP COLUMN "updatedAt",
ADD COLUMN     "prompt" TEXT NOT NULL,
ADD COLUMN     "response" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "destinationLatitude" DOUBLE PRECISION,
ADD COLUMN     "destinationLongitude" DOUBLE PRECISION,
ADD COLUMN     "destinationNote" TEXT,
ADD COLUMN     "pickupLatitude" DOUBLE PRECISION,
ADD COLUMN     "pickupLongitude" DOUBLE PRECISION,
ADD COLUMN     "pickupNote" TEXT;

-- CreateTable
CREATE TABLE "restaurants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "menu" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "price" DOUBLE PRECISION,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_recommendations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "intentType" TEXT NOT NULL,
    "intentValue" TEXT,
    "isLiked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "food_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "food_recommendations_userId_idx" ON "food_recommendations"("userId");

-- CreateIndex
CREATE INDEX "food_recommendations_restaurantId_idx" ON "food_recommendations"("restaurantId");

-- CreateIndex
CREATE INDEX "food_recommendations_createdAt_idx" ON "food_recommendations"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "ai_chats_userId_idx" ON "ai_chats"("userId");

-- CreateIndex
CREATE INDEX "ai_chats_createdAt_idx" ON "ai_chats"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "food_recommendations" ADD CONSTRAINT "food_recommendations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_recommendations" ADD CONSTRAINT "food_recommendations_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
