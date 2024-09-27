import { model, Schema, Types } from "mongoose";

export interface IRefreshToken {
  refreshToken: string;
  user: Types.ObjectId;
  creationDate: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  refreshToken: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  creationDate: {
    type: Date,
    required: true,
  },
});

export const RefreshToken = model<IRefreshToken>(
  "RefreshToken",
  RefreshTokenSchema,
);
