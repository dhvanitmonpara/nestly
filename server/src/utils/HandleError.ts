import { Response } from "express";
import { ApiError } from "./ApiError";
import { env } from "../conf/env";

interface MongoServerError extends Error {
  name: string;
  code: number;
}

function handleError(
  error: unknown,
  res: Response | null,
  fallbackMessage: string,
  fallbackErrorCode: string,
  duplicationErrorMessage?: string
) {
  if (env.ENVIRONMENT !== "production") {
    console.error(fallbackMessage, error);
  } else {
    console.error(fallbackMessage, {
      name: (error as Error)?.name,
      message: (error as Error)?.message,
      code: (error as any)?.code,
    });
  }

  if (isMongoDuplicateError(error)) {
    return res?.status(400).json({
      error: duplicationErrorMessage || "Duplicate key error",
      code: "DUPLICATE_KEY",
    });
  }

  if (error instanceof ApiError) {
    if (
      error.statusCode === 401 &&
      (error.message === "Access token not found" ||
        error.message === "Access and refresh token not found")
    ) {
      return res?.status(401).json({
        error: "Unauthorized",
        hasRefreshToken: error.message === "Access token not found",
        code: error.code || fallbackErrorCode,
      });
    }
    return res?.status(error.statusCode || 500).json({
      error: error.message || fallbackMessage,
      code: error.code || fallbackErrorCode,
    });
  }

  return res?.status(500).json({
    error: fallbackMessage,
    code: fallbackErrorCode,
  });
}

function isMongoDuplicateError(error: unknown): error is MongoServerError {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as MongoServerError).name === "MongoServerError" &&
    (error as MongoServerError).code === 11000
  );
}

export default handleError;
