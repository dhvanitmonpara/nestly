import { Request, Response } from "express";
import handleError from "../utils/HandleError";
import { ApiError } from "../utils/ApiError";
import prisma from "../db/db";
import ApiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";

export const createChannel = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, serverId, type } = req.body;

    const channel = await prisma.channel.create({
      data: {
        name,
        serverId: Number(serverId),
        type: type || "text",
      },
    });

    return ApiResponse.created(
      {
        channel,
      },
      "Channel created successfully"
    );
  }
);

export const getChannelById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const channel = await prisma.channel.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!channel) {
      throw new ApiError({ statusCode: 404, message: "Channel not found" });
    }

    return ApiResponse.ok(
      {
        channel,
      },
      "Channel retrieved successfully"
    );
  }
);

export const deleteChannel = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const channel = await prisma.channel.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!channel) {
      throw new ApiError({ statusCode: 404, message: "Channel not found" });
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

    return ApiResponse.ok(
      {
        message: "Channel deleted successfully",
      },
      "Channel deleted successfully"
    );
  }
);

export const getChannelByServer = asyncHandler(
  async (req: Request, res: Response) => {
    const { serverId } = req.params;

    const channels = await prisma.channel.findMany({
      where: {
        serverId: Number(serverId),
      },
    });

    return ApiResponse.ok(channels, "Channels retrieved successfully");
  }
);

export const updateChannel = asyncHandler(
  async (req: Request, res: Response) => {
    const { name } = req.body;
    const { id } = req.params;

    const channel = await prisma.channel.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
      },
    });

    return ApiResponse.ok(
      {
        channel,
      },
      "Channel updated successfully"
    );
  }
);
