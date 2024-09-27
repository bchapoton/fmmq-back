import { IImportMetadata } from "../models/import.model";

export function validateImportMetadataFormat(json: IImportMetadata) {
  if (json) {
    if (!json.folder) {
      return false;
    }
    if (!json.folderLabel) {
      return false;
    }

    if (!Array.isArray(json.files)) {
      return false;
    }

    for (let index in json.files) {
      const current = json.files[index];
      if (!(current && current.artist && current.title && current.file)) {
        return false;
      }
    }

    return true;
  }
  return false;
}
