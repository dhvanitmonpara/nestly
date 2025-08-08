import { Request, Response } from "express"
import handleError from "../utils/HandleError"
import { ApiError } from "../utils/ApiError"
import Message from "../models/message.model"
import Channel from "../models/channel.model"
import User from "../models/user.model"

export const createMessage = async (req: Request, res: Response) => {
    try {

        const { content, channel_id } = req.body

        if (!req.user) throw new ApiError(401, "Unauthorized")

        if (!content || !channel_id) throw new ApiError(400, "Content and Channel Id are required")

        const message = await Message.create({
            content,
            user_id: req.user.id,
            channel_id
        })

        if (!message) {
            throw new ApiError(400, "Failed to create message");
        }

        return res.status(200).json({
            message: "Message created successfully",
            messageObject: message
        })

    } catch (error) {
        handleError(error, res, "Failed to create message", "MESSAGE_CREATION")
    }
}

export const loadMessages = async (req: Request, res: Response) => {
    try {
        const { channelId } = req.params

        if (!channelId) throw new ApiError(400, "Channel Id and User Id are required")

        const channel = await Channel.findOne({
            where: { id: channelId }
        })

        if (!channel) throw new ApiError(404, "Channel not found")

        const messages = await Message.findAll({
            where: {
                channel_id: channelId,
            },
            include: {
                model: User,
                attributes: ["username", "id", "display_name", "accent_color"],
            }
        })

        return res.status(200).json({
            channel: {
                ...channel.dataValues,
                messages
            },
            message: "Messages fetched successfully"
        })

    } catch (error) {
        handleError(error, res, "Failed to create message", "MESSAGE_CREATION")
    }
}