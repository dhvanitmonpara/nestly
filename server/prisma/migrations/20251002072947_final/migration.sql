-- DropForeignKey
ALTER TABLE "public"."Channel" DROP CONSTRAINT "Channel_serverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DirectConversation" DROP CONSTRAINT "DirectConversation_userId1_fkey";

-- DropForeignKey
ALTER TABLE "public"."DirectConversation" DROP CONSTRAINT "DirectConversation_userId2_fkey";

-- DropForeignKey
ALTER TABLE "public"."DirectMessage" DROP CONSTRAINT "DirectMessage_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DirectMessage" DROP CONSTRAINT "DirectMessage_senderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Member" DROP CONSTRAINT "Member_serverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Member" DROP CONSTRAINT "Member_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_channelId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Server" DROP CONSTRAINT "Server_ownerId_fkey";
