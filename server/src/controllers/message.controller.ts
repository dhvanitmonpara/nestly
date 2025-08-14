import e, { Request, Response } from "express";
import handleError from "../utils/HandleError";
import { ApiError } from "../utils/ApiError";
import Message from "../models/message.model";
import Channel from "../models/channel.model";
import User from "../models/user.model";

export const createMessage = async (req: Request, res: Response) => {
  try {
    const { content, channel_id } = req.body;

    if (!req.user) throw new ApiError(401, "Unauthorized");

    if (!content || !channel_id)
      throw new ApiError(400, "Content and Channel Id are required");

    const message = await Message.create({
      content,
      user_id: req.user.id,
      channel_id,
    });

    if (!message) {
      throw new ApiError(400, "Failed to create message");
    }

    return res.status(200).json({
      message: "Message created successfully",
      messageObject: message,
    });
  } catch (error) {
    handleError(error, res, "Failed to create message", "MESSAGE_CREATION");
  }
};

export const loadMessages = async (req: Request, res: Response) => {
  try {
    const { channelId } = req.params;

    if (!channelId)
      throw new ApiError(400, "Channel Id and User Id are required");

    const channel = await Channel.findByPk(channelId);

    if (!channel) throw new ApiError(404, "Channel not found");

    const messages = await Message.findAll({
      where: {
        channel_id: channelId,
      },
      include: {
        model: User,
        attributes: ["username", "id", "display_name", "accent_color"],
      },
    });

    return res.status(200).json({
      channel: {
        ...channel.dataValues,
        messages,
      },
      message: "Messages fetched successfully",
    });
  } catch (error) {
    handleError(error, res, "Failed to create message", "MESSAGE_CREATION");
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) throw new ApiError(400, "Message Id is required");

    const message = await Message.findByPk(id);

    if (!message) throw new ApiError(404, "Message not found");

    await Message.destroy({ where: { id } });

    return res.status(200).json({
      message: "Message deleted successfully",
    });
  } catch (error) {
    handleError(error, res, "Failed to delete message", "MESSAGE_DELETION");
  }
};

export const updateMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!id) throw new ApiError(400, "Message Id is required");
    if (!content) throw new ApiError(400, "Content is required");

    const message = await Message.findByPk(id);

    if (!message) throw new ApiError(404, "Message not found");

    await Message.update({ content }, { where: { id }, returning: true });

    return res.status(200).json({
      message: "Message updated successfully",
      messageObject: { ...message.dataValues, content },
    });
  } catch (error) {
    handleError(error, res, "Failed to update message", "MESSAGE_UPDATE");
  }
};
