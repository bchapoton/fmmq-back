import { model, Schema } from "mongoose";
import { ROLE_PLAYER } from "../constant/roles";

export interface IUser {
  nickname: string;
  email: string;
  password: string;
  role: string;
}

const UserSchema = new Schema<IUser>({
  nickname: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: ROLE_PLAYER,
  },
});

export const User = model<IUser>("User", UserSchema);
