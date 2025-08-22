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

    const conversation = await DirectConversation.findOne({
      where: {
        [Op.or]: [
          { user_id1, user_id2 },
          { user_id1: user_id2, user_id2: user_id1 },
        ],
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

    if (conversation) {
      return res.status(200).json({
        message: "Direct conversation has been created successfully",
        conversation,
      });
    }

    const newConversation = await DirectConversation.create({
      user_id1,
      user_id2,
    });

    const createdConversation = await DirectConversation.findByPk(newConversation.dataValues.id, {
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

    return res.status(201).json({
      message: "Direct conversation created successfully",
      conversation: createdConversation,
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
      },
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


export const deleteDirectMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) throw new ApiError(400, "Message Id is required");

    const message = await DirectMessage.findByPk(id);

    if (!message) throw new ApiError(404, "Message not found");

    await DirectMessage.destroy({ where: { id } });

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

    const message = await DirectMessage.findByPk(id);

    if (!message) throw new ApiError(404, "Message not found");

    await DirectMessage.update({ content }, { where: { id }, returning: true });

    return res.status(200).json({
      message: "Message updated successfully",
      messageObject: { ...message.dataValues, content },
    });
  } catch (error) {
    handleError(error, res, "Failed to update message", "MESSAGE_UPDATE");
  }
};