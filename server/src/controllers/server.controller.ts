import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import handleError from "../utils/HandleError";
import prisma from "../db/db";
import asyncHandler from "../utils/asyncHandler";
import ApiResponse from "../utils/ApiResponse";

export const createServer = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw new ApiError({ statusCode: 400, message: "Unauthorized" });
    const ownerId = req.user.id;
    const { name } = req.body;
    if (!name)
      throw new ApiError({
        statusCode: 400,
        message: "Server name is required",
      });

    const server = await prisma.server.create({
      data: { name, ownerId },
    });

    if (!server) {
      res.status(400).json({ error: "Failed to create server" });
      return;
    }

    return ApiResponse.ok({ server }, "Server created successfully!");
  }
);

export const joinServer = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw new ApiError({ statusCode: 400, message: "Unauthorized" });
  const { serverId } = req.body;
  const userId = req.user.id;
  if (!serverId)
    throw new ApiError({ statusCode: 400, message: "Server ID is required" });

  const server = await prisma.server.findFirst({
    where: {
      ownerId: userId,
      id: Number(serverId),
    },
  });

  if (server)
    throw new ApiError({
      statusCode: 400,
      message: "User can't join his own server",
    });

  const serverMembers = await prisma.member.findFirst({
    where: {
      userId,
      serverId: Number(serverId),
    },
  });

  if (serverMembers) {
    res.status(200).json({
      message: "User already joined this server",
      data: serverMembers,
    });
    return;
  }

  const joinedServer = await prisma.member.create({
    data: {
      userId,
      serverId: Number(serverId),
    },
  });

  if (!joinedServer) {
    res.status(400).json({ error: "Failed to join server" });
    return;
  }

  return ApiResponse.ok(serverMembers, "User joined the server successfully!");
});

export const getServerDetailsById = asyncHandler(
  async (req: Request, res: Response) => {
    const { serverId } = req.params;

    if (!serverId)
      throw new ApiError({ statusCode: 400, message: "Server Id is required" });

    const server = await prisma.server.findUnique({
      where: { id: Number(serverId) },
    });

    if (!server)
      throw new ApiError({ statusCode: 400, message: "Server not found" });

    return ApiResponse.ok(
      {
        server,
      },
      "Server fetched successfully"
    );
  }
);

export const leaveServer = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw new ApiError({ statusCode: 400, message: "Unauthorized" });
  const { serverId } = req.params;
  const userId = req.user.id;
  if (!serverId)
    throw new ApiError({ statusCode: 400, message: "Server ID is required" });

  const serverMembers = await prisma.member.deleteMany({
    where: {
      userId,
      serverId: Number(serverId),
    },
  });

  if (!serverMembers) {
    res.status(400).json({ error: "Failed to leave server" });
    return;
  }

  return ApiResponse.ok(
    {
      message: "User left the server successfully!",
      data: serverMembers,
    },
    "Server left successfully"
  );
});

export const getJoinedServer = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw new ApiError({ statusCode: 400, message: "Unauthorized" });
    const userId = req.user.id;

    const [ownerServers, memberServers] = await Promise.all([
      prisma.server.findMany({
        where: {
          ownerId: userId,
        },
      }),
      prisma.member.findMany({
        where: {
          userId: Number(userId),
        },
        include: {
          server: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    const flattenedMemberServers = memberServers.map((member) => ({
      ...member,
      name: member.server.name,
      id: member.serverId,
      server: undefined,
    }));

    return ApiResponse.ok(
      [...ownerServers, ...flattenedMemberServers],
      "Servers fetched successfully"
    );
  }
);

export const deleteServer = asyncHandler(
  async (req: Request, res: Response) => {
    const { serverId } = req.params;

    if (!serverId)
      throw new ApiError({ statusCode: 400, message: "Server Id is required" });

    const channels = await prisma.channel.findMany({
      where: {
        serverId: Number(serverId),
      },
    });

    const channelIds = channels.map((c) => c.id);

    await prisma.message.deleteMany({
      where: {
        channelId: { in: channelIds },
      },
    });

    await prisma.member.deleteMany({
      where: {
        serverId: Number(serverId),
      },
    });

    await prisma.channel.deleteMany({
      where: {
        serverId: Number(serverId),
      },
    });

    if (channelIds.length > 0) {
      await prisma.message.deleteMany({
        where: {
          channelId: { in: channelIds },
        },
      });
    }

    const server = await prisma.server.delete({
      where: {
        id: Number(serverId),
      },
    });

    if (!server)
      throw new ApiError({ statusCode: 400, message: "Server Id is invalid" });

    return ApiResponse.ok(
      {
        message: "Server deleted successfully",
      },
      "Server deleted successfully"
    );
  }
);

export const updateServer = asyncHandler(
  async (req: Request, res: Response) => {
    const { serverId } = req.params;

    if (!serverId)
      throw new ApiError({ statusCode: 404, message: "Server Id is required" });

    const { name } = req.body;

    const server = await prisma.server.update({
      data: { name },
      where: { id: Number(serverId) },
    });

    return ApiResponse.ok(
      {
        message: "Server updated successfully",
        server,
      },
      "Server updated successfully"
    );
  }
);

export const getMembersByServer = asyncHandler(
  async (req: Request, res: Response) => {
    const { serverId } = req.params;

    if (!serverId)
      throw new ApiError({ statusCode: 400, message: "Server Id is required" });

    const server = await prisma.server.findUnique({
      where: {
        id: Number(serverId),
      },
    });

    if (!server)
      throw new ApiError({ statusCode: 404, message: "Server not found" });

    const [members, owner] = await Promise.all([
      prisma.member.findMany({
        where: {
          serverId: Number(serverId),
        },
        include: {
          user: {
            select: {
              username: true,
              displayName: true,
              accentColor: true,
            },
          },
        },
      }),
      prisma.user.findUnique({
        where: {
          id: server.ownerId,
        },
        select: {
          username: true,
          displayName: true,
          accentColor: true,
        },
      }),
    ]);

    return ApiResponse.ok(
      {
        message: "Members fetched successfully",
        members: members.map((m) => ({
          ...m,
          user: {
            username: m.user.username,
            displayName: m.user.displayName,
            accentColor: m.user.accentColor,
          },
        })),
        owner: {
          server_id: serverId,
          user_id: server.ownerId,
          user: owner,
        },
      },
      "Members fetched successfully"
    );
  }
);

export const kickMember = asyncHandler(async (req: Request, res: Response) => {
  const { userId, serverId } = req.params;

  // if (!userId || !serverId)
  // throw new ApiError(400, "User ID and Server ID are required");

  const member = await prisma.member.findUnique({
    where: {
      userId_serverId: {
        userId: Number(userId),
        serverId: Number(serverId),
      },
    },
  });

  if (!member)
    throw new ApiError({ statusCode: 404, message: "Member not found" });

  await prisma.member.delete({
    where: {
      userId_serverId: {
        userId: Number(userId),
        serverId: Number(serverId),
      },
    },
  });

  return ApiResponse.ok(
    {
      message: "User left the server successfully",
    },
    "User left the server successfully"
  );
});
