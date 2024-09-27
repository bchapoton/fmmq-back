import { model, Schema } from "mongoose";

export interface IServerConfig {
  version: number;
  creationDate: Date;
  updateDate?: Date;
}

const ServerConfigSchema = new Schema<IServerConfig>({
  version: {
    type: Number,
    required: true,
  },
  creationDate: {
    type: Date,
    required: true,
  },
  updateDate: {
    type: Date,
    default: undefined,
  },
});

export const ServerConfig = model<IServerConfig>(
  "ServerConfig",
  ServerConfigSchema,
);
