import { Request, Response } from "express";
import handleError from "../utils/HandleError";
import { ApiError } from "../utils/ApiError";
import Channel from "../models/channel.model";
import Message from "../models/message.model";

export const createChannel = async (req: Request, res: Response) => {
    try {
        const { name, server_id, type } = req.body;

        if (!name || !server_id) {
            throw new ApiError(400, "Name and Server ID are required");
        }

        const channel = await Channel.create({
            name,
            server_id,
            type: type || "text",
        });

        return res.status(201).json({
            message: "Channel created successfully",
            channel
        });
    } catch (error) {
        handleError(error as ApiError, res, "Failed to create channel", "CREATE_CHANNEL");
    }
}

export const getChannelById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const channel = await Channel.findByPk(id);

        if (!channel) {
            throw new ApiError(404, "Channel not found");
        }

        return res.status(200).json({
            message: "Channel retrieved successfully",
            channel
        });
    } catch (error) {
        handleError(error as ApiError, res, "Failed to retrieve channel", "GET_CHANNEL");
    }
};

export const deleteChannel = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const channel = await Channel.findByPk(id);

        if (!channel) {
            throw new ApiError(404, "Channel not found");
        }

        const messages = await Message.destroy({
            where: {
                channel_id: id
            }
        });

        await channel.destroy();

        return res.status(200).json({
            message: "Channel deleted successfully"
        });
    } catch (error) {
        handleError(error as ApiError, res, "Failed to delete channel", "DELETE_CHANNEL");
    }
}

export const getChannelByServer = async (req: Request, res: Response) => {
    try {
        const { serverId } = req.params;

        if (!serverId) throw new ApiError(400, "Server ID is required");

        const channels = await Channel.findAll({
            where: {
                server_id: serverId
            }
        });

        return res.status(200).json({
            message: "Channels retrieved successfully",
            channels
        });
    } catch (error) {
        handleError(error as ApiError, res, "Failed to get channels by server", "GET_CHANNEL_BY_SERVER");
    }
}