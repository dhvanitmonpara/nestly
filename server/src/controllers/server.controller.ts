import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import handleError from "../utils/HandleError";
import prisma from "../db/db";

export const createServer = async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new ApiError(400, "Unauthorized");
    const ownerId = req.user.id;
    const { name } = req.body;
    if (!name) throw new ApiError(400, "Server name is required");

    const server = await prisma.server.create({
      data: { name, ownerId },
    });

    if (!server) {
      res.status(400).json({ error: "Failed to create server" });
      return;
    }

    res.status(200).json({ message: "Server created successfully!", server });
  } catch (error) {
    handleError(
      error as ApiError,
      res,
      "Failed to create server",
      "CREATE_SERVER"
    );
  }
};

export const joinServer = async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new ApiError(400, "Unauthorized");
    const { serverId } = req.body;
    const userId = req.user.id;
    if (!serverId) throw new ApiError(400, "Server ID is required");

    const server = await prisma.server.findFirst({
      where: {
        ownerId: userId,
        id: Number(serverId),
      },
    });

    if (server) throw new ApiError(400, "User can't join his own server");

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
    console.log(joinedServer);

    res.status(200).json({
      message: "User joined the server successfully!",
      data: serverMembers,
    });
  } catch (error) {
    handleError(error as ApiError, res, "Failed to join server", "JOIN_SERVER");
  }
};

export const getServerDetailsById = async (req: Request, res: Response) => {
  try {
    const { serverId } = req.params;

    if (!serverId) throw new ApiError(400, "Server Id is required");

    const server = await prisma.server.findUnique({
      where: { id: Number(serverId) },
    });

    if (!server) throw new ApiError(400, "Server not found");

    return res.status(200).json({
      server,
      message: "Server fetched successfully",
    });
  } catch (error) {
    handleError(
      error as ApiError,
      res,
      "Failed to get server details",
      "GET_SERVER_DETAILS"
    );
  }
};

export const leaveServer = async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(400, "Unauthorized");
  const { serverId } = req.params;
  const userId = req.user.id;
  if (!serverId) throw new ApiError(400, "Server ID is required");

  try {
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

    res.status(200).json({
      message: "User left the server successfully!",
      data: serverMembers,
    });
  } catch (error) {
    handleError(
      error as ApiError,
      res,
      "Failed to leave server",
      "LEAVE_SERVER"
    );
  }
};

export const getJoinedServer = async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new ApiError(400, "Unauthorized");
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

    return res.status(200).json({
      message: "Servers fetched successfully",
      servers: [...ownerServers, ...flattenedMemberServers],
    });
  } catch (error) {
    handleError(
      error as ApiError,
      res,
      "Failed to get servers",
      "GET_JOINED_SERVERS"
    );
  }
};

export const deleteServer = async (req: Request, res: Response) => {
  try {
    const { serverId } = req.params;

    if (!serverId) throw new ApiError(400, "Server Id is required");

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

    if (!server) throw new ApiError(400, "Server Id is invalid");

    return res.status(200).json({
      message: "Server deleted successfully",
    });
  } catch (error) {
    handleError(
      error as ApiError,
      res,
      "Failed to delete server",
      "DELETE_SERVER"
    );
  }
};

export const updateServer = async (req: Request, res: Response) => {
  try {
    const { serverId } = req.params;

    if (!serverId) throw new ApiError(404, "Server Id is required");

    const { name } = req.body;

    const server = await prisma.server.update({
      data: { name },
      where: { id: Number(serverId) },
    });

    return res.status(200).json({
      message: "Server updated successfully",
      server,
    });
  } catch (error) {
    handleError(
      error as ApiError,
      res,
      "Failed to update server",
      "FETCH_CHANNELS"
    );
  }
};

export const getMembersByServer = async (req: Request, res: Response) => {
  try {
    const { serverId } = req.params;

    if (!serverId) throw new ApiError(400, "Server Id is required");

    const server = await prisma.server.findUnique({
      where: {
        id: Number(serverId),
      },
    });

    if (!server) throw new ApiError(404, "Server not found");

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

    return res.status(200).json({
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
    });
  } catch (error) {
    handleError(
      error as ApiError,
      res,
      "Failed to fetch members",
      "FETCH_MEMBERS"
    );
  }
};

export const kickMember = async (req: Request, res: Response) => {
  try {
    const { userId, serverId } = req.params;

    if (!userId || !serverId)
      throw new ApiError(400, "User ID and Server ID are required");

    const member = await prisma.member.findUnique({
      where: {
        userId_serverId: {
          userId: Number(userId),
          serverId: Number(serverId),
        },
      },
    });

    if (!member) throw new ApiError(404, "Member not found");

    await prisma.member.delete({
      where: {
        userId_serverId: {
          userId: Number(userId),
          serverId: Number(serverId),
        },
      },
    });

    return res.status(200).json({
      message: "User left the server successfully",
    });
  } catch (error) {
    handleError(
      error as ApiError,
      res,
      "Failed to leave server",
      "LEAVE_SERVER"
    );
  }
};
