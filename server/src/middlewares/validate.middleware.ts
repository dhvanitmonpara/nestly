import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { ZodType } from "zod";

export const validate =
  <T>(schema: ZodType<T>, dataSource: "body" | "query" | "params" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const data = req[dataSource];

    const result = schema.safeParse(data);

    if (!result.success) {
      // Use result.error.issues directly
      const formattedErrors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
        code: issue.code,
      }));

      throw new ApiError({
        statusCode: 400,
        message: formattedErrors.map((error) => error.message).join(", ") || "Validation Error",
        code: "VALIDATION_ERROR",
        errors: formattedErrors,
      });
    }

    // Attach validated data
    (req as any).validated = (req as any).validated || {};
    (req as any).validated[dataSource] = result.data;

    next();
  };
