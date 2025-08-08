import Message from "../models/message.model";
import { ApiError } from "../utils/ApiError";
import handleError from "../utils/HandleError";

const createMessage = async (content: string, user_id: string, channel_id: string) => {
  if (!content) throw new ApiError(400, "Message is required");

  try {
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

export { createMessage };