import { Request, Response } from "express";
import handleError from "../utils/HandleError";
import { ApiError } from "../utils/ApiError";
import prisma from "../db/db";

export const createChannel = async (req: Request, res: Response) => {
  try {
    const { name, serverId, type } = req.body;

    if (!name || !serverId) {
      throw new ApiError(400, "Name and Server ID are required");
    }

    const channel = await prisma.channel.create({
      data: {
        name,
        serverId: Number(serverId),
        type: type || "text",
      },
    });

    return res.status(201).json({
      message: "Channel created successfully",
      channel,
    });
  } catch (error) {
    handleError(
      error as ApiError,
      res,
      "Failed to create channel",
      "CREATE_CHANNEL"
    );
  }
};

export const getChannelById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const channel = await prisma.channel.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!channel) {
      throw new ApiError(404, "Channel not found");
    }

    return res.status(200).json({
      message: "Channel retrieved successfully",
      channel,
    });
  } catch (error) {
    handleError(
      error as ApiError,
      res,
      "Failed to retrieve channel",
      "GET_CHANNEL"
    );
  }
};

export const deleteChannel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const channel = await prisma.channel.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!channel) {
      throw new ApiError(404, "Channel not found");
    }

    await prisma.message.deleteMany({
      where: {
        channelId: Number(id),
      },
    });

    await prisma.channel.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      message: "Channel deleted successfully",
    });
  } catch (error) {
    handleError(
      error as ApiError,
      res,
      "Failed to delete channel",
      "DELETE_CHANNEL"
    );
  }
};

export const getChannelByServer = async (req: Request, res: Response) => {
  try {
    const { serverId } = req.params;

    if (!serverId) throw new ApiError(400, "Server ID is required");

    const channels = await prisma.channel.findMany({
      where: {
        serverId: Number(serverId),
      },
    });

    return res.status(200).json({
      message: "Channels retrieved successfully",
      channels,
    });
  } catch (error) {
    handleError(
      error as ApiError,
      res,
      "Failed to get channels by server",
      "GET_CHANNEL_BY_SERVER"
    );
  }
};

export const updateChannel = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const { channelId } = req.params;

    if (!channelId) throw new ApiError(404, "Channel Id is required");

    const channel = await prisma.channel.update({
      where: {
        id: Number(channelId),
      },
      data: {
        name,
      },
    });

    return res.status(200).json({
      message: "Channel updated successfully",
      channel,
    });
  } catch (error) {
    handleError(
      error as ApiError,
      res,
      "Failed to update channel",
      "CHANNEL_UPDATION"
    );
  }
};
