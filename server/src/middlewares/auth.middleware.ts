import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import jwt, { JwtPayload } from "jsonwebtoken";
import handleError from "../utils/HandleError";
import { env } from "../conf/env";
import prisma from "../db/db";

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
      throw new ApiError({
        statusCode: 401,
        message: "Unauthorized",
        data: { service: "authMiddleware.verifyUserJWT" },
      });
    }

    const decodedToken = jwt.verify(
      token,
      env.ACCESS_TOKEN_SECRET
    ) as JwtPayload;

    if (!decodedToken || typeof decodedToken == "string") {
      throw new ApiError({
        statusCode: 401,
        message: "Invalid Access Token",
        code: "INVALID_ACCESS_TOKEN",
        data: { service: "authMiddleware.verifyUserJWT" },
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decodedToken.id,
      },
    });

    if (!user) {
      throw new ApiError({
        statusCode: 401,
        message: "User not found",
        code: "USER_NOT_FOUND",
        data: { service: "authMiddleware.verifyUserJWT" },
      });
    }

    if (!user.refreshToken) {
      throw new ApiError({
        statusCode: 401,
        message: "Refresh token session is not valid",
        code: "INVALID_SESSION",
        data: { service: "authMiddleware.verifyUserJWT" },
      });
    }

    const mappedUser = {
      ...user,
      password: null,
      refreshToken: null,
    };

    req.user = mappedUser;
    next();
  } catch (error) {
    handleError(error, res, "Invalid Access Token", "UNAUTHORIZED");
  }
};

export { verifyUserJWT };
