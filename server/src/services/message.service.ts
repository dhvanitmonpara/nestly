import { ApiError } from "../utils/ApiError";
import handleError from "../utils/HandleError";
import prisma from "../db/db"

const createMessage = async (content: string, userId: number, channelId: number) => {
  try {

    if (!content) throw new ApiError(400, "Message is required");
    const message = await prisma.message.create({
      data: {
        content,
        userId,
        channelId: Number(channelId)
      }
    })

    if (!message) {
      throw new ApiError(400, "Failed to create message");
    }

    return message;
  } catch (error) {
    handleError(error as ApiError, null, "Failed to create message", "CREATE_MSG");
  }
};

const createDirectMessage = async (content: string, senderId: string, conversation_id: string) => {
  try {
    if (!content) throw new ApiError(400, "Message is required")
    const message = await prisma.directMessage.create({
      data: {
        content,
        conversationId: Number(conversation_id),
        senderId: Number(senderId)
      }
    })

    if (!message) throw new ApiError(400, "Failed to create message")

    return message

  } catch (error) {
    handleError(error as ApiError, null, "Failed to create message", "CREATE_DIRECT_MSG");
  }
}

export { createMessage, createDirectMessage };