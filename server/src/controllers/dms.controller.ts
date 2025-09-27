import e, { Request, Response } from "express";
import handleError from "../utils/HandleError";
import { ApiError } from "../utils/ApiError";
import prisma from "../db/db";

export const createDirectConversation = async (req: Request, res: Response) => {
  try {
    const { user_id1, user_id2 } = req.body;

    if (!user_id1 || !user_id2)
      throw new ApiError(400, "User ID 1 and 2 are required");

    const conversation = await prisma.directConversation.findFirst({
      where: {
        OR: [
          { userId1: Number(user_id1), userId2: Number(user_id2) },
          { userId1: Number(user_id2), userId2: Number(user_id1) },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            displayName: true,
            accentColor: true,
          },
        },
        user2: {
          select: {
            id: true,
            username: true,
            displayName: true,
            accentColor: true,
          },
        },
      },
    });

    if (conversation) {
      return res.status(200).json({
        message: "Direct conversation has been created successfully",
        conversation,
      });
    }

    const newConversation = await prisma.directConversation.create({
      data: {
        userId1: Number(user_id1),
        userId2: Number(user_id2),
      },
    });

    const createdConversation = await prisma.directConversation.findUnique({
      where: {
        id: newConversation.id,
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            displayName: true,
            accentColor: true,
          },
        },
        user2: {
          select: {
            id: true,
            username: true,
            displayName: true,
            accentColor: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: "Direct conversation created successfully",
      conversation: createdConversation,
    });
  } catch (error) {
    handleError(
      error,
      res,
      "Failed to create direct conversation",
      "CREATE_DIRECT_CONVERSATION"
    );
  }
};

export const listDirectConversations = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const conversations = await prisma.directConversation.findMany({
      where: {
        OR: [{ userId1: Number(userId) }, { userId2: Number(userId) }],
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            displayName: true,
            accentColor: true,
          },
        },
        user2: {
          select: {
            id: true,
            username: true,
            displayName: true,
            accentColor: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Direct conversations fetched successfully",
      conversations,
    });
  } catch (error) {
    handleError(
      error,
      res,
      "Failed to get direct conversations",
      "LIST_DIRECT_CONVERSATION"
    );
  }
};

export const deleteDirectConversation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const conversation = await prisma.directConversation.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!conversation) throw new ApiError(404, "Direct conversation not found");

    await prisma.directMessage.deleteMany({
      where: {
        conversationId: Number(id),
      },
    });

    await prisma.directConversation.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      message: "Direct conversation deleted successfully",
    });
  } catch (error) {
    handleError(
      error,
      res,
      "Failed to delete direct conversation",
      "DELETE_DIRECT_CONVERSATION"
    );
  }
};

export const getDirectConversationMessages = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const conversation = await prisma.directConversation.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            displayName: true,
            accentColor: true,
          },
        },
        user2: {
          select: {
            id: true,
            username: true,
            displayName: true,
            accentColor: true,
          },
        },
      },
    });

    if (!conversation) throw new ApiError(404, "Direct conversation not found");

    const messages = await prisma.directMessage.findMany({
      where: {
        conversationId: Number(id),
      },
    });

    return res.status(200).json({
      message: "Direct conversation messages fetched successfully",
      conversation: {
        ...conversation,
        messages,
      },
    });
  } catch (error) {
    handleError(
      error,
      res,
      "Failed to get direct conversation messages",
      "GET_DIRECT_CONVERSATION_MESSAGES"
    );
  }
};

export const getConversationUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const conversation = await prisma.directConversation.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            displayName: true,
            accentColor: true,
          },
        },
        user2: {
          select: {
            id: true,
            username: true,
            displayName: true,
            accentColor: true,
          },
        },
      },
    });

    if (!conversation) throw new ApiError(404, "Direct conversation not found");

    return res.status(200).json({
      message: "Direct conversation users fetched successfully",
      users: [conversation.user1, conversation.user2],
    });
  } catch (error) {
    handleError(
      error,
      res,
      "Failed to get direct conversation users",
      "GET_DIRECT_CONVERSATION_USERS"
    );
  }
};

export const deleteDirectMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) throw new ApiError(400, "Message Id is required");

    const message = await prisma.directMessage.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!message) throw new ApiError(404, "Message not found");

    await prisma.directMessage.delete({
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

export const updateDirectMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!id) throw new ApiError(400, "Message Id is required");
    if (!content) throw new ApiError(400, "Content is required");

    const message = await prisma.directMessage.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!message) throw new ApiError(404, "Message not found");

    const updatedMessage = await prisma.directMessage.update({
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
