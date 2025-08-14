import DirectMessage from "../models/directMessage.model";
import Message from "../models/message.model";
import { ApiError } from "../utils/ApiError";
import handleError from "../utils/HandleError";

const createMessage = async (content: string, user_id: string, channel_id: string) => {
  try {

    if (!content) throw new ApiError(400, "Message is required");
    const message = await Message.create({
      content,
      user_id,
      channel_id
    })

    if (!message) {
      throw new ApiError(400, "Failed to create message");
    }

    return message;
  } catch (error) {
    handleError(error as ApiError, null, "Failed to create message", "CREATE_MSG");
  }
};

const createDirectMessage = async (content: string, sender_id: string, conversation_id: string) => {
  try {
    if (!content) throw new ApiError(400, "Message is required")
    const message = await DirectMessage.create({
      content,
      conversation_id,
      sender_id
    })

    if (!message) throw new ApiError(400, "Failed to create message")

    return message

  } catch (error) {
    handleError(error as ApiError, null, "Failed to create message", "CREATE_DIRECT_MSG");
  }
}

export { createMessage, createDirectMessage };