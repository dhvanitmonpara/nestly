import e, { Request, Response } from "express";
import handleError from "../utils/HandleError";
import { ApiError } from "../utils/ApiError";
import generateSuggestionHandler from "../utils/generateSuggestion";
import prisma from "../db/db";

export const createMessage = async (req: Request, res: Response) => {
  try {
    const { content, channelId } = req.body;

    if (!req.user) throw new ApiError(401, "Unauthorized");

    if (!content || !channelId)
      throw new ApiError(400, "Content and Channel Id are required");

    const message = await prisma.message.create({
      data: {
        content,
        userId: req.user.id,
        channelId: Number(channelId),
      },
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

    const channel = await prisma.channel.findUnique({
      where: {
        id: Number(channelId),
      },
    });

    if (!channel) throw new ApiError(404, "Channel not found");

    const messages = await prisma.message.findMany({
      where: {
        channelId: Number(channelId),
      },
      include: {
        user: {
          select: {
            username: true,
            id: true,
            displayName: true,
            accentColor: true,
          },
        },
      },
    });

    return res.status(200).json({
      channel: {
        ...channel,
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

    const message = await prisma.message.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!message) throw new ApiError(404, "Message not found");

    await prisma.message.delete({
      where: {
        id: Number(id),
      },
    });

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

    const message = await prisma.message.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!message) throw new ApiError(404, "Message not found");

    const updatedMessage = await prisma.message.update({
      where: {
        id: Number(id),
      },
      data: {
        content,
      },
    });

    return res.status(200).json({
      message: "Message updated successfully",
      messageObject: { ...updatedMessage, content },
    });
  } catch (error) {
    handleError(error, res, "Failed to update message", "MESSAGE_UPDATE");
  }
};

export const generateSuggestion = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text) throw new ApiError(400, "Text value is required");

    const suggestions = await generateSuggestionHandler(text);

    return res.status(201).json({
      message: "Suggestions generated successfully",
      suggestions,
    });
  } catch (error) {
    handleError(
      error,
      res,
      "Failed to generate suggestion",
      "SUGGESTION_ERROR"
    );
  }
};
