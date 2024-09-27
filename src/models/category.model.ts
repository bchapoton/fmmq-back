import { model, Schema } from "mongoose";

export interface ICategory {
  label: string;
  description: string;
  order: number;
  allMusicsOnServer?: boolean;
}

const CategorySchema = new Schema<ICategory>({
  label: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    index: true,
  },
  allMusicsOnServer: {
    type: Boolean,
    default: true,
  },
});

export const Category = model<ICategory>("Category", CategorySchema);
