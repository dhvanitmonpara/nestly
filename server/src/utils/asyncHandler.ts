import { RequestHandler, Request, Response, NextFunction } from "express";
import ApiResponse from "./ApiResponse";

const asyncHandler =
  (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
  ): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .then((result) => {
        if (result instanceof ApiResponse) {
          return res.status(result.statusCode).json(result);
        }
      })
      .catch(next);
  };

export default asyncHandler;
