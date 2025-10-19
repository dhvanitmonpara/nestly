import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import prisma from "../db/db";
import asyncHandler from "../utils/asyncHandler";
import ApiResponse from "../utils/ApiResponse";

export const createDirectConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId1, userId2 } = req.body;

    const conversation = await prisma.directConversation.findFirst({
      where: {
        OR: [
          { userId1: Number(userId1), userId2: Number(userId2) },
          { userId1: Number(userId2), userId2: Number(userId1) },
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
        userId1: Number(userId1),
        userId2: Number(userId2),
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

    return ApiResponse.created(
      {
        conversation: createdConversation,
      },
      "Direct conversation created successfully"
    );
  }
);

export const listDirectConversations = asyncHandler(
  async (req: Request, res: Response) => {
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
  }
);

export const deleteDirectConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const conversation = await prisma.directConversation.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!conversation)
      throw new ApiError({
        statusCode: 404,
        message: "Direct conversation not found",
      });

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

    return ApiResponse.ok({}, "Direct conversation deleted successfully");
  }
);

export const getDirectConversationMessages = asyncHandler(
  async (req: Request, res: Response) => {
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

    if (!conversation)
      throw new ApiError({
        statusCode: 404,
        message: "Direct conversation not found",
      });

    const messages = await prisma.directMessage.findMany({
      where: {
        conversationId: Number(id),
      },
    });

    return ApiResponse.ok(
      {
        ...conversation,
        messages,
      },
      "Direct conversation messages fetched successfully"
    );
  }
);

export const getConversationUser = asyncHandler(
  async (req: Request, res: Response) => {
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

    if (!conversation)
      throw new ApiError({
        statusCode: 404,
        message: "Direct conversation not found",
      });

    return ApiResponse.ok(
      {
        users: [conversation.user1, conversation.user2],
      },
      "Direct conversation users fetched successfully"
    );
  }
);

export const deleteDirectMessage = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const message = await prisma.directMessage.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!message)
      throw new ApiError({ statusCode: 404, message: "Message not found" });

    await prisma.directMessage.delete({
      where: {
        id: Number(id),
      },
    });

    return ApiResponse.ok({}, "Message deleted successfully");
  }
);

export const updateDirectMessage = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { content } = req.body;

    const message = await prisma.directMessage.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!message)
      throw new ApiError({ statusCode: 404, message: "Message not found" });

    const updatedMessage = await prisma.directMessage.update({
      where: {
        id: Number(id),
      },
      data: {
        content,
      },
    });

    return ApiResponse.ok(
      {
        messageObject: { ...updatedMessage, content },
      },
      "Message updated successfully"
    );
  }
);
