import { model, Schema } from "mongoose";

export interface IMusic {
  artist: string;
  artistSanitized: string;
  title: string;
  titleSanitized: string;
  file: string;
  randomInt: number;
  categoryId: string;
  ownerId: string;
  ownerNickname: string;
  importObjectId: string;
}

const MusicSchema = new Schema<IMusic>({
  artist: {
    type: String,
    required: true,
  },
  artistSanitized: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  titleSanitized: {
    type: String,
    required: true,
  },
  file: {
    type: String,
    required: true,
  },
  randomInt: {
    type: Number,
    required: true,
    index: true,
  },
  categoryId: {
    type: String,
  },
  ownerId: {
    type: String,
    required: true,
  },
  ownerNickname: {
    type: String,
    required: true,
  },
  importObjectId: {
    type: String,
    index: true,
  },
});

MusicSchema.index({ randomInt: 1, categoryId: 1 });
MusicSchema.index({ ownerId: 1, artist: 1 });

export const Music = model<IMusic>("Music", MusicSchema);
