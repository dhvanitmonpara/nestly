export class ApiError extends Error {
  statusCode: number;
  code: string;
  success: boolean;
  errors?: Record<string, any>[];
  data?: unknown;
  isOperational: boolean;

  constructor({
    statusCode = 500,
    message = "Something went wrong",
    code = "GENERIC_ERROR",
    errors,
    data,
  }: {
    statusCode?: number;
    message?: string;
    code?: string;
    errors?: Record<string, any>[];
    data?: unknown;
  }) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.success = false;
    this.errors = errors;
    this.data = data;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
