/*
  Warnings:

  - You are about to drop the column `accent_color` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `auth_type` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `display_name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token` on the `User` table. All the data in the column will be lost.
  - Added the required column `authType` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `displayName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "accent_color",
DROP COLUMN "auth_type",
DROP COLUMN "display_name",
DROP COLUMN "refresh_token",
ADD COLUMN     "accentColor" TEXT NOT NULL DEFAULT '6a7282',
ADD COLUMN     "authType" "public"."AuthType" NOT NULL,
ADD COLUMN     "displayName" TEXT NOT NULL,
ADD COLUMN     "refreshToken" TEXT;
