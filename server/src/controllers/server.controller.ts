import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import handleError from "../utils/HandleError";
import Channel from "../models/channel.model";
import Member from "../models/members.model";
import Message from "../models/message.model";
import Server from "../models/server.model";
import { Op } from "sequelize";
import User from "../models/user.model";

export const createServer = async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new ApiError(400, "Unauthorized");
    const owner_id = req.user.id;
    const { name } = req.body;
    if (!name) throw new ApiError(400, "Server name is required");

    const server = await Server.create({
      name,
      owner_id,
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
    const { server_id } = req.body;
    const user_id = req.user.id;
    if (!server_id) throw new ApiError(400, "Server ID is required");

    const server = await Server.findOne({
      where: {
        owner_id: user_id,
        id: server_id,
      },
    });

    if (server) throw new ApiError(400, "User can't join his own server");

    const serverMembers = await Member.findOrCreate({
      where: {
        user_id,
        server_id,
      },
    });

    if (!serverMembers) {
      res.status(400).json({ error: "Failed to join server" });
      return;
    }

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

    const server = await Server.findOne({
      where: { id: serverId },
    });

    if (!server) throw new ApiError(400, "Server not found");

    return res.status(200).json({
      server: server.dataValues,
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
  const user_id = req.user.id;
  if (!serverId) throw new ApiError(400, "Server ID is required");

  try {
    const serverMembers = await Member.destroy({
      where: {
        user_id: user_id,
        server_id: serverId,
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
      Server.findAll({
        where: {
          owner_id: userId,
        },
      }),
      Member.findAll({
        where: {
          user_id: userId,
        },
        include: {
          model: Server,
          attributes: ["name"],
        },
      }),
    ]);

    const flattenedMemberServers = memberServers.map((member) => ({
      ...member.dataValues,
      name: member.dataValues.server.name,
      id: member.dataValues.server_id,
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

    const channels = await Channel.findAll({
      where: {
        server_id: serverId,
      },
    });

    const channelIds = channels.map((c) => c.dataValues.id);

    await Message.destroy({
      where: {
        channel_id: { [Op.in]: channelIds },
      },
    });

    await Member.destroy({
      where: {
        server_id: serverId,
      },
    });

    await Channel.destroy({
      where: {
        server_id: serverId,
      },
    });

    if (channelIds.length > 0) {
      await Message.destroy({
        where: {
          channel_id: { [Op.in]: channelIds },
        },
      });
    }

    await Member.destroy({
      where: {
        id: serverId,
      },
    });

    const server = await Server.destroy({
      where: { id: serverId },
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

    const server = await Server.update({ name }, { where: { id: serverId } });

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

    const server = await Server.findOne({
      where: {
        id: serverId,
      },
    });

    if (!server) throw new ApiError(404, "Server not found");

    const [members, owner] = await Promise.all([
      Member.findAll({
        where: {
          server_id: serverId,
        },
        include: {
          model: User,
          attributes: ["username", "display_name", "accent_color"],
        },
      }),
      User.findOne({
        where: {
          id: server.dataValues.owner_id,
        },
        attributes: ["username", "display_name", "accent_color"],
      }),
    ]);

    return res.status(200).json({
      message: "Members fetched successfully",
      members: members.map((m) => m.dataValues),
      owner: {
        server_id: serverId,
        user_id: server.dataValues.owner_id,
        user: owner?.dataValues,
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

    if (!userId || !serverId) throw new ApiError(400, "User ID and Server ID are required");

    const member = await Member.findOne({
      where: {
        user_id: userId,
        server_id: serverId,
      },
    });

    if (!member) throw new ApiError(404, "Member not found");

    await member.destroy();

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
}