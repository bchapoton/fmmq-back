import { Types } from "mongoose";

declare global {
  namespace Express {
    export interface Request {
      userContext?: UserRequestContext;
    }
  }
}

export type UserRequestContext = {
  _id: Types.ObjectId;
  email: string;
  nickname: string;
  role: string;
  tokenDate: number;
  expire: number;
};
