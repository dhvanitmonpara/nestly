import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import handleError from "../utils/HandleError";
import Channel from "../models/channel.model";
import Member from "../models/members.model";
import Message from "../models/message.model";
import Server from "../models/server.model";
import { Op } from "sequelize";

export const createServer = async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new ApiError(400, "Unauthorized")
    const owner_id = req.user.id
    const { name } = req.body;
    if (!name) throw new ApiError(400, "Server name is required");

    const server = await Server.create({
      name,
      owner_id
    })

    if (!server) {
      res.status(400).json({ error: "Failed to create server" });
      return;
    }

    res
      .status(200)
      .json({ message: "Server created successfully!", server });
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
    if (!req.user) throw new ApiError(400, "Unauthorized")
    const { server_id } = req.body;
    const user_id = req.user.id
    if (!server_id)
      throw new ApiError(400, "Server ID is required");

    const server = await Server.findOne({
      where: {
        owner_id: user_id,
        id: server_id
      }
    })

    if (server) throw new ApiError(400, "User can't join his own server")

    const serverMembers = await Member.findOrCreate({
      where: {
        user_id,
        server_id
      }
    })

    if (!serverMembers) {
      res.status(400).json({ error: "Failed to join server" });
      return;
    }

    res
      .status(200)
      .json({ message: "User joined the server successfully!", data: serverMembers });
  } catch (error) {
    handleError(
      error as ApiError,
      res,
      "Failed to join server",
      "JOIN_SERVER"
    );
  }
};

export const getServerDetailsById = async (req: Request, res: Response) => {
  try {

    const { serverId } = req.params

    if (!serverId) throw new ApiError(400, "Server Id is required")

    const server = await Server.findOne({
      where: { id: serverId }
    })

    if (!server) throw new ApiError(400, "Server not found")

    return res.status(200).json({
      server: server.dataValues,
      message: "Server fetched successfully"
    })

  } catch (error) {
    handleError(
      error as ApiError,
      res,
      "Failed to get server details",
      "GET_SERVER_DETAILS"
    );
  }
}

export const leaveServer = async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(400, "Unauthorized")
  const { server_id } = req.body;
  const user_id = req.user.id
  if (!server_id)
    throw new ApiError(400, "Server ID is required");

  try {
    const serverMembers = await Member.destroy({
      where: {
        user_id: user_id,
        server_id: server_id
      }
    })

    if (!serverMembers) {
      res.status(400).json({ error: "Failed to leave server" });
      return;
    }

    res
      .status(200)
      .json({ message: "User left the server successfully!", data: serverMembers });
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
    if (!req.user) throw new ApiError(400, "Unauthorized")
    const userId = req.user.id

    const [ownerServers, memberServers] = await Promise.all([
      Server.findAll({
        where: {
          owner_id: userId
        }
      }),
      Member.findAll({
        where: {
          user_id: userId
        },
        include: {
          model: Server,
          attributes: ["name"],
        }
      })
    ])

    const flattenedMemberServers = memberServers.map(member => ({
      ...member.dataValues,
      name: member.dataValues.server.name,
      id: member.dataValues.server_id,
      server: undefined,
    }));

    return res.status(200).json({
      message: "Servers fetched successfully",
      servers: [...ownerServers, ...flattenedMemberServers]
    })

  } catch (error) {
    handleError(
      error as ApiError,
      res,
      "Failed to get servers",
      "GET_JOINED_SERVERS"
    );
  }
}

export const deleteServer = async (req: Request, res: Response) => {
  try {
    const { serverId } = req.params

    if (!serverId) throw new ApiError(400, "Server Id is required")

    const channels = await Channel.findAll({
      where: {
        server_id: serverId
      }
    })

    const channelIds = channels.map(c => c.dataValues.id)

    await Channel.destroy({
      where: {
        server_id: serverId
      },
    })

    if (channelIds.length > 0) {
      await Message.destroy({
        where: {
          channel_id: { [Op.in]: channelIds }
        }
      });
    }

    await Member.destroy({
      where: {
        id: serverId
      }
    })

    const server = await Server.destroy({
      where: { id: serverId }
    })

    if (!server) throw new ApiError(400, "Server Id is invalid")

    return res.status(200).json({
      message: "Server deleted successfully"
    })

  } catch (error) {
    handleError(
      error as ApiError,
      res,
      "Failed to delete server",
      "DELETE_SERVER"
    );
  }
}

export const updateServer = async (req: Request, res: Response) => {
  try {

    const { serverId } = req.params

    if (!serverId) throw new ApiError(404, "Server Id is required")

    const { name } = req.body

    const server = await Server.update(
      { name },
      { where: { id: serverId } }
    )

    return res.status(200).json({
      message: "Server updated successfully",
      server
    })

  } catch (error) {
    handleError(
      error as ApiError,
      res,
      "Failed to update server",
      "FETCH_CHANNELS"
    );
  }
}