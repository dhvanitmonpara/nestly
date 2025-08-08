// src/types/express/index.d.ts

import "express"
import { IUser } from "../IUser"

declare global {
  namespace Express {
    interface Request {
      user?: IUser
    }
  }
}
