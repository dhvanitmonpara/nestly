import e, { Request, Response } from "express";
import handleError from "../utils/HandleError";
import { ApiError } from "../utils/ApiError";
import DirectConversation from "../models/directConversation.model";
import { Op } from "sequelize";
import User from "../models/user.model";
import DirectMessage from "../models/directMessage.model";

export const createDirectConversation = async (req: Request, res: Response) => {
  try {
    const { user_id1, user_id2 } = req.body;

    if (!user_id1 || !user_id2)
      throw new ApiError(400, "User ID 1 and 2 are required");

    const [conversation] = await DirectConversation.findOrCreate({
      where: {
        [Op.or]: [
          { user_id1, user_id2 },
          { user_id1: user_id2, user_id2: user_id1 },
        ],
      },
      defaults: {
        user_id1,
        user_id2,
      },
    });

    return res.status(200).json({
      message: "Direct conversation has been created successfully",
      conversation,
    });
  } catch (error) {
    handleError(
      error,
      res,
      "Failed to create conversation",
      "CREATE_DIRECT_CONVERSATION"
    );
  }
};

export const listDirectConversations = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const conversations = await DirectConversation.findAll({
      where: {
        [Op.or]: [{ user_id1: userId }, { user_id2: userId }],
      },
      include: [
        {
          model: User,
          as: "user1",
          attributes: ["username", "id", "display_name", "accent_color"],
        },
        {
          model: User,
          as: "user2",
          attributes: ["username", "id", "display_name", "accent_color"],
        },
      ],
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

    const conversation = await DirectConversation.findByPk(id);

    if (!conversation) throw new ApiError(404, "Direct conversation not found");

    await DirectMessage.destroy({
      where: {
        conversation_id: id,
      },
    });

    await conversation.destroy();

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

    const conversation = await DirectConversation.findByPk(id, {
      include: [
        {
          model: User,
          as: "user1",
          attributes: ["username", "id", "display_name", "accent_color"],
        },
        {
          model: User,
          as: "user2",
          attributes: ["username", "id", "display_name", "accent_color"],
        },
      ],
    });

    if (!conversation) throw new ApiError(404, "Direct conversation not found");

    const messages = await DirectMessage.findAll({
      where: {
        conversation_id: id,
      }
    });

    return res.status(200).json({
      message: "Direct conversation messages fetched successfully",
      conversation: {
        ...conversation.dataValues,
        messages: messages.map((msg) => msg.dataValues),
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
