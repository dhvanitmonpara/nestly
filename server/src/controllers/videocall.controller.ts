import { Request, Response } from "express";
import { AccessToken, VideoGrant } from "livekit-server-sdk";
import { env } from "../conf/env";
import handleError from "../utils/HandleError";
import videocallService from "../services/videocall.service";

export const getToken = async (req: Request, res: Response) => {
    try {
        const { room, identity } = req.body;

        if (!room || !identity) {
            return res.status(400).send("Missing room or identity");
        }

        const at = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
            identity: identity,
        });

        const videoGrant: VideoGrant = {
            room: room,
            roomJoin: true,
            canPublish: true,
            canSubscribe: true,
        };

        at.addGrant(videoGrant);

        const token = await at.toJwt();

        return res.json({ token });
    } catch (error) {
        handleError(error as Error, res, "Failed to generate token", "GET_VIDEOCALL_TOKEN");
    }
}

export const getParticipants = async (req: Request, res: Response) => {
    try {
        const { room } = req.params;

        if (!room) {
            return res.status(400).send("Missing room");
        }

        const participants = await videocallService.listParticipantsByRoom(room);

        return res.status(200).json({ participants: participants.map(p => ({ username: p.identity })) });
    } catch (error) {
        handleError(error as Error, res, "Failed to get participants", "GET_VIDEOCALL_PARTICIPANTS");
    }
}