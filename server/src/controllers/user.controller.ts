import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import userService from "../services/user.service";
import prisma from "../db/db";
import asyncHandler from "../utils/asyncHandler";
import ApiResponse from "../utils/ApiResponse";

export const googleCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const code = req.query.code as string;

    const { redirectUrl } = await userService.handleGoogleOAuth(code, req);

    return res.redirect(redirectUrl);
  }
);

export const handleUserOAuth = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, username } = req.body;

    const { createdUser, accessToken, refreshToken } =
      await userService.handleUserOAuth(email, username, req);

    userService.setAuthCookies(res, accessToken, refreshToken);
    return ApiResponse.created(
      {
        ...createdUser,
        refreshToken: null,
        password: null,
        email: null,
      },
      "Form submitted successfully!"
    );
  }
);

export const handleTempToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { tempToken } = req.body;

    const tokens = userService.redeemTempToken(tempToken);

    if (!tokens)
      throw new ApiError({
        statusCode: 400,
        message: "Invalid or expired token",
        code: "INVALID_TEMP_TOKEN",
        data: { service: "userService.handleTempToken" },
      });

    const { accessToken, refreshToken } = tokens;

    userService.setAuthCookies(res, accessToken, refreshToken);
    return ApiResponse.ok({
      success: true,
    });
  }
);

export const initializeUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, username, password } = req.body;

    // Optional: can replace this with a Zod validation middleware
    if (!email || !username || !password)
      throw new ApiError({
        statusCode: 400,
        message: "All fields are required",
        data: { service: "userService.initializeUserService" },
      });

    const savedEmail = await userService.initializeUserService(
      email,
      username,
      password
    );

    return ApiResponse.created(
      {
        email: savedEmail,
      },
      "User initialized successfully and OTP sent"
    );
  }
);

export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    const { createdUser, accessToken, refreshToken } =
      await userService.registerUserService(email, req);

    userService.setAuthCookies(res, accessToken, refreshToken);
    return ApiResponse.created(
      {
        ...createdUser,
        refreshToken: null,
        password: null,
        email: null,
      },
      "Form submitted successfully!"
    );
  }
);

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } =
    await userService.loginUserService(email, password, req);

  userService.setAuthCookies(res, accessToken, refreshToken);

  return ApiResponse.ok(
    {
      ...user,
      password: null,
      refreshToken: null,
    },
    "User logged in successfully!"
  );
});

export const getUserData = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.user.id) {
    throw new ApiError({
      statusCode: 400,
      message: "User not found",
      data: { service: "userService.getUserDataService" },
    });
  }

  const user = {
    ...req.user,
    password: null,
    refreshToken: null,
  };

  return ApiResponse.ok(user, "User fetched successfully!");
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const user = await userService.getUserByIdService(Number(userId));

  return ApiResponse.ok(user, "User feteched successfully");
});

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id)
    throw new ApiError({
      statusCode: 400,
      message: "User not found",
      data: { service: "userService.logoutUserService" },
    });

  await userService.logoutUserService(req.user.id);

  userService.clearAuthCookies(res);

  return ApiResponse.ok({ success: true }, "User logged out successfully");
});

export const refreshAccessToken = asyncHandler(
  async (req: Request, res: Response) => {
    const incomingRefreshToken =
      req.cookies.__refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken)
      throw new ApiError({
        statusCode: 401,
        message: "Unauthorized request",
        data: { service: "userService.refreshAccessTokenService" },
      });

    const { accessToken, refreshToken } =
      await userService.refreshAccessTokenService(incomingRefreshToken, req);

    userService.setAuthCookies(res, accessToken, refreshToken);

    return ApiResponse.ok(
      { success: true },
      "Access token refreshed successfully"
    );
  }
);

export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const { messageId } = await userService.sendOtpService(email);

  return ApiResponse.ok(
    {
      messageId,
    },
    "OTP sent successfully"
  );
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user)
    throw new ApiError({
      statusCode: 401,
      message: "Unauthorized request",
      data: { service: "userService.updateUserService" },
    });

  const { accentColor, displayName } = req.body;

  const updatedUser = await userService.updateUserService(req.user.id, {
    accentColor,
    displayName,
  });

  return ApiResponse.ok(updatedUser, "User updated successfully");
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  const isVerified = await userService.verifyOtpService(email, otp);

  return ApiResponse.ok(
    {
      isVerified,
    },
    isVerified ? "OTP verified successfully" : "Invalid OTP"
  );
});

export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const { query } = req.params;

  const users = await userService.searchUsersService(query);

  return ApiResponse.ok(users, "Users fetched successfully");
});
