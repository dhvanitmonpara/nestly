import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import jwt, { JwtPayload } from "jsonwebtoken";
import handleError from "../utils/HandleError";
import { env } from "../conf/env";
import User from "../models/user.model";

const verifyUserJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies?.__accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized");
    }

    const decodedToken = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as JwtPayload;

    if (!decodedToken || typeof decodedToken == "string") {
      throw new ApiError(401, "Invalid Access Token", "INVALID_ACCESS_TOKEN");
    }

    const user = await User.findByPk(decodedToken.id)

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    if (!user.dataValues.refresh_token) {
      throw new ApiError(401, "Refresh token session is not valid", "INVALID_SESSION");
    }

    const mappedUser = {
      ...user.dataValues,
      password: null,
      refresh_token: null,
    };

    req.user = mappedUser;
    next();
  } catch (error) {
    handleError(error, res, "Invalid Access Token", "UNAUTHORIZED");
  }
};

export {
  verifyUserJWT,
};
