import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import handleError from "../utils/HandleError";
import Channel from "../models/channel.model";
import ChannelMembers from "../models/channel-members.model";
import Message from "../models/message.model";

export const createChannel = async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new ApiError(400, "Unauthorized")
    const owner_id = req.user.id
    const { name } = req.body;
    if (!name) throw new ApiError(400, "Channel name is required");

    const channel = await Channel.create({
      name,
      owner_id
    })

    if (!channel) {
      res.status(400).json({ error: "Failed to create channel" });
      return;
    }

    res
      .status(200)
      .json({ message: "Channel created successfully!", channel });
  } catch (error) {
    handleError(
      error as ApiError,
      res,
      "Failed to create channel",
      "CREATE_CHANNEL"
    );
  }
};

export const joinChannel = async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new ApiError(400, "Unauthorized")
    const { channel_id } = req.body;
    const user_id = req.user.id
    if (!channel_id)
      throw new ApiError(400, "Channel ID is required");

    const channel = await Channel.findOne({
      where: {
        owner_id: user_id,
        id: channel_id
      }
    })

    if (channel) throw new ApiError(400, "User can't join his own channel")

    const channelMembers = await ChannelMembers.findOrCreate({
      where: {
        user_id,
        channel_id
      }
    })

    if (!channelMembers) {
      res.status(400).json({ error: "Failed to join channel" });
      return;
    }

    res
      .status(200)
      .json({ message: "User joined the channel successfully!", data: channelMembers });
  } catch (error) {
    handleError(
      error as ApiError,
      res,
      "Failed to join channel",
      "JOIN_CHANNEL"
    );
  }
};

export const getChannelDetailsById = async (req: Request, res: Response) => {
  try {

    const { channelId } = req.params

    if (!channelId) throw new ApiError(400, "Channel Id is required")

    const channel = await Channel.findOne({
      where: { id: channelId }
    })

    if (!channel) throw new ApiError(400, "Channel not found")

    return res.status(200).json({
      channel: channel.dataValues,
      message: "Channel feteched successfully"
    })

  } catch (error) {
    handleError(
      error as ApiError,
      res,
      "Failed to get channel details",
      "GET_CHANNEL_DETAILS"
    );
  }
}

export const leaveChannel = async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(400, "Unauthorized")
  const { channel_id } = req.body;
  const user_id = req.user.id
  if (!channel_id)
    throw new ApiError(400, "Channel ID is required");

  try {
    const channelMembers = await ChannelMembers.destroy({
      where: {
        user_id: user_id,
        channel_id: channel_id
      }
    })

    if (!channelMembers) {
      res.status(400).json({ error: "Failed to leave channel" });
      return;
    }

    res
      .status(200)
      .json({ message: "User left the channel successfully!", data: channelMembers });
  } catch (error) {
    handleError(
      error as ApiError,
      res,
      "Failed to leave channel",
      "LEAVE_CHANNEL"
    );
  }
};

export const getJoinedChannel = async (req: Request, res: Response) => {
  try {
    if (!req.user) throw new ApiError(400, "Unauthorized")
    const userId = req.user.id

    const [ownerChannels, memberChannels] = await Promise.all([
      Channel.findAll({
        where: {
          owner_id: userId
        }
      }),
      ChannelMembers.findAll({
        where: {
          user_id: userId
        },
        include: {
          model: Channel,
          attributes: ["name"],
        }
      })
    ])

    const flattenedMemberChannels = memberChannels.map(member => ({
      ...member.dataValues,
      name: member.dataValues.channel.name,
      id: member.dataValues.channel_id,
      channel: undefined,
    }));

    return res.status(200).json({
      message: "Channels fetched successfully",
      channels: [...ownerChannels, ...flattenedMemberChannels]
    })

  } catch (error) {
    handleError(
      error as ApiError,
      res,
      "Failed to get channels",
      "FETCH_CHANNELS"
    );
  }
}

export const deleteChannel = async (req: Request, res: Response) => {
  try {
    const { channelId } = req.params

    if (!channelId) throw new ApiError(400, "Channel Id is required")

    const messages = await Message.destroy({
      where: {
        channel_id: channelId
      }
    })

    const channelMembers = await ChannelMembers.destroy({
      where: {
        channel_id: channelId
      }
    })

    const channel = await Channel.destroy({
      where: { id: channelId }
    })

    if (!channel) throw new ApiError(400, "Channel Id is invalid")

    return res.status(200).json({
      channelMembers,
      channel,
      messages
    })

  } catch (error) {
    handleError(
      error as ApiError,
      res,
      "Failed to delete channels",
      "FETCH_CHANNELS"
    );
  }
}