import { model, Schema } from "mongoose";

export interface IImport {
  metadata: IImportMetadata;
  imported: boolean;
  lastImportedBy: string;
  ownerId: string;
  ownerNickname: string;
  lastImported: Date;
  creationDate: Date;
  categoryId: string;
}

export interface IImportMetadata {
  folderLabel: string;
  folder: string;
  files: Array<{
    artist: string;
    title: string;
    file: string;
  }>;
}

const ImportSchema = new Schema<IImport>({
  metadata: {
    type: {
      folderLabel: {
        type: String,
        required: true,
      },
      folder: {
        type: String,
        required: true,
      },
      files: {
        type: [
          {
            artist: {
              type: String,
              required: true,
            },
            title: {
              type: String,
              required: true,
            },
            file: {
              type: String,
              required: true,
            },
          },
        ],
        required: true,
      },
    },
    required: true,
  },
  imported: {
    type: Boolean,
    required: true,
  },
  lastImported: {
    type: Date,
    default: undefined,
  },
  lastImportedBy: {
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
  creationDate: {
    type: Date,
    required: true,
    index: true,
  },
  categoryId: {
    type: String,
  },
});

ImportSchema.index({ ownerId: 1, creationDate: -1 });

export const Import = model<IImport>("Import", ImportSchema);
