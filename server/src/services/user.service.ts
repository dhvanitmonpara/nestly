import { env } from "../conf/env";
import { randomUUID } from "crypto";
import { ApiError } from "../utils/ApiError";
import generateDeviceFingerprint from "../utils/generateDeviceFingerprint";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../db/db";
import nodeCache from "./cache.service";
import axios from "axios";
import { hashOTP } from "../utils/cryptographer";

class UserService {
  options: null | {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "none" | "lax";
    domain?: string;
  } = null;
  accessTokenExpiry = 60 * 1000 * parseInt(env.ACCESS_TOKEN_EXPIRY || "0"); // In minutes
  refreshTokenExpiry =
    60 * 60 * 1000 * 24 * parseInt(env.REFRESH_TOKEN_EXPIRY || "0"); // In days

  constructor() {
    this.options = {
      httpOnly: true,
      secure: env.ENVIRONMENT === "production",
      ...(env.ENVIRONMENT === "production" ? {} : { domain: "localhost" }),
      sameSite:
        env.ENVIRONMENT === "production"
          ? ("none" as "none")
          : ("lax" as "lax"),
    };
  }

  async generateUuidBasedUsername(
    isUsernameTaken: (username: string) => Promise<boolean>,
    length = 12
  ) {
    const maxTries = 20;

    for (let i = 0; i < maxTries; i++) {
      const uuid = randomUUID().replace(/-/g, "").slice(0, length);

      const exists = await isUsernameTaken(uuid);
      if (!exists) {
        return uuid;
      }
    }

    // Fallback username in case of failure
    const fallbackUsername = `User${Date.now()}${Math.floor(
      Math.random() * 1000
    )}`;
    return fallbackUsername;
  }

  generateAccessToken(id: number, username: string) {
    return jwt.sign(
      {
        id,
        username,
      },
      env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: `${parseInt(env.ACCESS_TOKEN_EXPIRY || "0")}m`,
      }
    );
  }

  generateRefreshToken(id: number, username: string) {
    return jwt.sign(
      {
        id,
        username,
      },
      env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: `${parseInt(env.REFRESH_TOKEN_EXPIRY || "0")}d`,
      }
    );
  }

  async generateAccessAndRefreshToken(userId: number, req: Request) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user)
      throw new ApiError({
        statusCode: 404,
        message: "User not found",
        data: { service: "userService.generateAccessAndRefreshToken" },
      });

    const accessToken = this.generateAccessToken(user.id, user.username);
    const refreshToken = this.generateRefreshToken(user.id, user.username);

    const userAgent = await generateDeviceFingerprint(req);
    const rawIp =
      req.headers["cf-connecting-ip"] ||
      req.headers["x-forwarded-for"] ||
      req.ip;

    const ip = (Array.isArray(rawIp) ? rawIp[0] : rawIp || "")
      .split(",")[0]
      .trim();

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return { accessToken, refreshToken, userAgent, ip };
  }

  setAuthCookies = (
    res: Response,
    accessToken: string,
    refreshToken: string
  ) => {
    res
      .cookie("__accessToken", accessToken, {
        ...userService.options,
        maxAge: userService.accessTokenExpiry,
      })
      .cookie("__refreshToken", refreshToken, {
        ...userService.options,
        maxAge: userService.refreshTokenExpiry,
      });
  };

  handleGoogleOAuth = async (code: string, req: Request) => {
    // 1. Exchange code for access token
    const { data } = await axios.post(
      "https://oauth2.googleapis.com/token",
      null,
      {
        params: {
          code,
          client_id: env.GOOGLE_OAUTH_CLIENT_ID,
          client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET,
          redirect_uri: `${env.SERVER_BASE_URI}/api/v1/users/google/callback`,
          grant_type: "authorization_code",
        },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { access_token } = data;

    // 2. Get user info
    const userInfoRes = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const user = userInfoRes.data;

    // 3. Check existing user
    const existingUser = await prisma.user.findFirst({
      where: { email: user.email.toLowerCase() },
    });

    let redirectUrl: string;

    if (existingUser) {
      const { accessToken, refreshToken } =
        await this.generateAccessAndRefreshToken(existingUser.id, req);

      const tempToken = crypto.randomUUID();
      nodeCache.set(tempToken, {
        accessToken,
        refreshToken,
        createdAt: Date.now(),
      });

      redirectUrl = `${env.ACCESS_CONTROL_ORIGIN}/auth/oauth/signin?tempToken=${tempToken}`;
    } else {
      redirectUrl = `${env.ACCESS_CONTROL_ORIGIN}/auth/oauth/callback?email=${user.email}`;
    }

    return { redirectUrl };
  };

  handleUserOAuth = async (email: string, username: string, req: Request) => {
    const createdUser = await prisma.user.create({
      data: {
        email,
        username,
        displayName: username,
        password: null,
        authType: "oauth",
      },
    });

    if (!createdUser)
      throw new ApiError({
        statusCode: 500,
        message: "Failed to create user",
        data: { service: "userService.handleUserOAuth" },
      });

    const { accessToken, refreshToken } =
      await userService.generateAccessAndRefreshToken(createdUser.id, req);

    if (!accessToken || !refreshToken) {
      throw new ApiError({
        statusCode: 500,
        message: "Failed to generate access and refresh token",
        code: "INTERNAL_SERVER_ERROR",
        data: { service: "userService.handleUserOAuth" },
      });
    }

    return {
      createdUser,
      accessToken,
      refreshToken,
    };
  };

  redeemTempToken = (tempToken: string) => {
    const stored: { accessToken: string; refreshToken: string } | undefined =
      nodeCache.get(tempToken);

    if (!stored) return null;

    nodeCache.del(tempToken);

    return stored;
  };

  initializeUserService = async (
    email: string,
    username: string,
    password: string
  ) => {
    const existingUser = await prisma.user.findFirst({ where: { email } });
    if (existingUser)
      throw new ApiError({
        statusCode: 400,
        message: "User with this email already exists",
        data: { service: "userService.initializeUserService" },
      });

    const usernameTaken = await prisma.user.findFirst({ where: { username } });
    if (usernameTaken)
      throw new ApiError({
        statusCode: 400,
        message: "Username is already taken",
        data: { service: "userService.initializeUserService" },
      });

    const user = { email: email.toLowerCase(), username, password };

    const cacheSuccess = nodeCache.set(`pending:${email}`, user, 300);
    if (!cacheSuccess)
      throw new ApiError({
        statusCode: 500,
        message: "Failed to set user in cache",
        data: { service: "userService.initializeUserService" },
      });

    return email;
  };

  registerUserService = async (email: string, req: Request) => {
    const user = nodeCache.get(`pending:${email}`);
    if (!user)
      throw new ApiError({
        statusCode: 400,
        message: "User not found",
        data: { service: "userService.registerUserService" },
      });

    const { password, username } = user as {
      password: string;
      username: string;
    };

    const encryptedPassword = await bcrypt.hash(password, 12);

    const createdUser = await prisma.user.create({
      data: {
        email,
        password: encryptedPassword,
        username,
        displayName: username,
        authType: "manual",
      },
    });

    const { accessToken, refreshToken } =
      await this.generateAccessAndRefreshToken(createdUser.id, req);

    if (!accessToken || !refreshToken)
      throw new ApiError({
        statusCode: 500,
        message: "Failed to generate access and refresh token",
        data: { service: "userService.registerUserService" },
      });

    // Cleanup cache
    nodeCache.del(`pending:${email}`);
    nodeCache.del(`otp:${email}`);

    return { createdUser, accessToken, refreshToken };
  };

  loginUserService = async (email: string, password: string, req: Request) => {
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user)
      throw new ApiError({
        statusCode: 400,
        message: "User not found",
        data: { service: "userService.loginUserService" },
      });
    if (!user.password)
      throw new ApiError({
        statusCode: 400,
        message: "Password not set",
        data: { service: "userService.loginUserService" },
      });

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid)
      throw new ApiError({
        statusCode: 400,
        message: "Invalid password",
        data: { service: "userService.loginUserService" },
      });

    const { accessToken, refreshToken, userAgent, ip } =
      await userService.generateAccessAndRefreshToken(user.id, req);

    return { user, accessToken, refreshToken };
  };

  logoutUserService = async (userId: number) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user)
      throw new ApiError({
        statusCode: 400,
        message: "User not found",
        data: { service: "userService.logoutUserService" },
      });

    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: "" },
    });
  };

  clearAuthCookies = (res: Response) => {
    res
      .clearCookie("__accessToken", { ...userService.options, maxAge: 0 })
      .clearCookie("__refreshToken", { ...userService.options, maxAge: 0 });
  };

  getUserByIdService = async (userId: number) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user)
      throw new ApiError({
        statusCode: 404,
        message: "User doesn't exists",
        data: { service: "userService.getUserByIdService" },
      });

    return user;
  };

  refreshAccessTokenService = async (
    incomingRefreshToken: string,
    req: Request
  ) => {
    if (!incomingRefreshToken)
      throw new ApiError({
        statusCode: 401,
        message: "Unauthorized request",
        data: { service: "userService.refreshAccessTokenService" },
      });

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      env.REFRESH_TOKEN_SECRET
    );
    if (!decodedToken || typeof decodedToken === "string")
      throw new ApiError({
        statusCode: 401,
        message: "Invalid Access Token",
        data: { service: "userService.refreshAccessTokenService" },
      });

    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id },
    });
    if (!user || !user.refreshToken)
      throw new ApiError({
        statusCode: 401,
        message: "Invalid Refresh Token",
        data: { service: "userService.refreshAccessTokenService" },
      });

    if (!user.refreshToken.includes(incomingRefreshToken))
      throw new ApiError({
        statusCode: 401,
        message: "Refresh token is invalid or not recognized",
        data: { service: "userService.refreshAccessTokenService" },
      });

    const { accessToken, refreshToken } =
      await userService.generateAccessAndRefreshToken(user.id, req);

    return { accessToken, refreshToken };
  };

  sendOtpService = async (email: string) => {
    if (!email)
      throw new ApiError({
        statusCode: 400,
        message: "Email is required",
        data: { service: "userService.sendOtpService" },
      });

    const mailResponse = await axios.post(
      "https://simple-smtp-service.vercel.app/api/v1/mail",
      {
        to: email,
        type: "OTP",
        options: { from: `"Nestly" <no-reply@nestly.com>` },
      },
      {
        headers: {
          "x-api-token": env.SMTP_API_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    const data = mailResponse.data?.data;
    if (!data?.success || !data?.details?.otp)
      throw new ApiError({
        statusCode: 500,
        message: "Failed to send OTP",
        data: { service: "userService.sendOtpService" },
      });

    const hashedOTP = await hashOTP(data.details.otp);

    const cacheSuccess = nodeCache.set(`otp:${email}`, hashedOTP, 65);
    if (!cacheSuccess)
      throw new ApiError({
        statusCode: 500,
        message: "Failed to set OTP in cache",
        data: { service: "userService.sendOtpService" },
      });

    return { otp: data.details.otp, messageId: data.messageId };
  };

  updateUserService = async (
    userId: number,
    updates: { accentColor?: string; displayName?: string }
  ) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user)
      throw new ApiError({
        statusCode: 404,
        message: "User not found",
        data: { service: "userService.updateUserService" },
      });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updates,
    });

    return updatedUser;
  };

  compareOTP = async (email: string, otp: string) => {
    try {
      const storedOtp = nodeCache.get(`otp:${email}`);

      const hashedOTP = await hashOTP(otp);

      if (storedOtp === hashedOTP) {
        nodeCache.del(`otp:${email}`);
        return true;
      } else {
        return false;
      }
    } catch {
      return false;
    }
  };

  verifyOtpService = async (email: string, otp: string): Promise<boolean> => {
    if (!email || !otp)
      throw new ApiError({
        statusCode: 400,
        message: "Email and OTP are required",
        data: { service: "userService.verifyOtpService" },
      });

    const cachedOtp = nodeCache.get<string>(`otp:${email}`);
    if (!cachedOtp) return false;

    const isValid = await this.compareOTP(email, otp);
    if (isValid) nodeCache.del(`otp:${email}`);

    return isValid;
  };

  // services/userService.ts
  searchUsersService = async (query: string) => {
    if (!query)
      throw new ApiError({
        statusCode: 400,
        message: "Query is required",
        data: { service: "userService.searchUsersService" },
      });

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        username: true,
        email: true,
        accentColor: true,
        displayName: true,
      },
    });

    return users;
  };
}

const userService = new UserService();
export default userService;
