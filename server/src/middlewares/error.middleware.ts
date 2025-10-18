// src/middlewares/errorMiddlewares.ts
import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import logger from "../utils/logger";
import { env } from "../conf/env";

class ErrorMiddlewares {
  public generalErrorHandler = (
    err: Error | ApiError,
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const isDev = env.ENVIRONMENT === "development";

    const error =
      err instanceof ApiError
        ? err
        : new ApiError({
            statusCode: 500,
            message: err.message || "Internal Server Error",
            code: "UNHANDLED_ERROR",
          });

    const logMeta = {
      path: req.originalUrl,
      method: req.method,
      statusCode: error.statusCode,
      code: error.code,
    };

    if (error.statusCode >= 500) {
      logger.error(error.message, { ...logMeta, stack: error.stack });
    } else {
      logger.warn(error.message, logMeta);
    }

    const response: Record<string, any> = {
      success: false,
      message: error.message,
      code: error.code,
    };

    if (error.errors) response.errors = error.errors;
    if (error.data) response.data = error.data;
    if (isDev && error.stack) response.stack = error.stack;

    res.status(error.statusCode).json(response);
  };

  public notFoundErrorHandler = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const message = `Route ${req.originalUrl} not found`;
    logger.warn(message, { method: req.method, path: req.originalUrl });
    next(new ApiError({ statusCode: 404, message, code: "NOT_FOUND" }));
  };
}

export default Object.freeze(new ErrorMiddlewares());
