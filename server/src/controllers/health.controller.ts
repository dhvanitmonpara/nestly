import { Request, Response, NextFunction } from "express";

const healthCheck = async () => {
  async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({message: "healthy"})
  }
};

export { healthCheck };