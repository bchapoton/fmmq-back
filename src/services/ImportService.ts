import { UnauthorizedException } from "../exceptions/UnauthorizedException";
import { ServerErrorException } from "../exceptions/ServerErrorException";
import { BadRequestException } from "../exceptions/BadRequestException";
import { validateImportMetadataFormat } from "./ValidationService";
import { Music } from "../models/music.model";
import { ObjectNotFoundException } from "../exceptions/ObjectNotFoundException";
import { MissingParametersException } from "../exceptions/MissingParametersException";
import {
  deleteMusicByImportId,
  getMusicRandomInt,
} from "../services/MusicService";
import { sanitizeMusicElement } from "../services/GameService";
import { IImport, IImportMetadata, Import } from "../models/import.model";
import { cacheService } from "./CacheService";
import { NextFunction } from "express";
import { UserRequestContext } from "../custom.express";
import { HydratedDocument } from "mongoose";

// @ts-ignore
export async function doImport(
  errorHandler: NextFunction,
  user: UserRequestContext | undefined,
  id: string,
  contributorUser: UserRequestContext | undefined = undefined,
) {
  const importEntity = await findImportByIdSync(errorHandler, id);
  if (
    !checkContributorAuthorized(errorHandler, contributorUser, importEntity)
  ) {
    return;
  }
  cacheService.clearCategoryMusicsCount();
  const userField = createImportByFromUser(errorHandler, user);
  if (importEntity && userField) {
    await deleteMusicByImportId(id);
    const start = new Date().getTime();
    const importId = importEntity._id.toString();
    const metadata = importEntity.metadata;
    const errors = [];
    const folder = metadata.folder;
    const files = metadata.files;
    let importedMusicCount = 0;
    for (let index in files) {
      const file = files[index];
      if (!file) {
        continue;
      }

      const trimArtist = file.artist.trim();
      const trimTitle = file.title.trim();
      const musicDocument = {
        artist: trimArtist,
        title: trimTitle,
        file: folder + "/" + file.file,
        artistSanitized: sanitizeArtist(trimArtist),
        titleSanitized: sanitizeTitle(trimTitle),
        randomInt: getMusicRandomInt(),
        importObjectId: importId,
        ownerId: userField.id,
        ownerNickname: userField.nickname,
      };

      if (!(musicDocument.artistSanitized && musicDocument.titleSanitized)) {
        errors.push(musicDocument);
        continue;
      }

      const musicEntity = new Music(musicDocument);
      musicEntity.save();
      importedMusicCount++;
    }

    importEntity.imported = true;
    importEntity.lastImported = new Date();
    importEntity.lastImportedBy = JSON.stringify(userField);
    await importEntity.save();

    const duration = new Date().getTime() - start;
    return {
      duration: duration,
      importedMusicCount: importedMusicCount,
      errorsCount: errors.length,
      documentsInError: errors,
    };
  } else {
    errorHandler(new ObjectNotFoundException());
  }
}

export function sanitizeArtist(artist: string | undefined) {
  if (!artist) return artist;
  return splitArtistWithFeatArray(sanitizeMusicElement(artist.trim()));
}

export function sanitizeTitle(title: string | undefined) {
  if (!title) return title;
  return sanitizeMusicElement(title.trim());
}

/**
 * Handle artist with ID3Tag array separated by ;
 * If we detect this case, split on the ; and take only the first array value
 *
 * @param value
 * @return {*|string}
 */
export function splitArtistWithFeatArray(value: string) {
  if (value.indexOf(";") > -1) {
    return value.split(";")[0];
  }
  return value;
}

export function findImportById(
  errorHandler: NextFunction,
  id: string,
  success: (importEntity: HydratedDocument<IImport>) => void,
) {
  if (id) {
    Import.findById(id)
      .exec()
      .then((entity) => {
        if (entity) {
          success(entity);
        } else {
          errorHandler(
            new ObjectNotFoundException("Can't find import with id : " + id),
          );
        }
      })
      .catch(errorHandler);
  } else {
    errorHandler(new MissingParametersException("Missing Import id"));
  }
}

export async function findImportByIdSync(
  errorHandler: NextFunction,
  id: string,
) {
  if (id) {
    try {
      return await Import.findById(id);
    } catch (e) {
      errorHandler(
        new ObjectNotFoundException("Can't find import with id : " + id),
      );
    }
  } else {
    errorHandler(new MissingParametersException("Missing Import id"));
  }

  return;
}

export async function createImport(
  errorHandler: NextFunction,
  user: UserRequestContext | undefined,
  payload: { metadata: IImportMetadata },
) {
  if (validateImportMetadataFormat(payload.metadata)) {
    const userField = createImportByFromUser(errorHandler, user);
    if (userField) {
      const importEntity = new Import({
        metadata: payload.metadata,
        imported: false,
        ownerId: userField.id,
        ownerNickname: userField.nickname,
        creationDate: new Date(),
      });
      await importEntity.save();
      /*
      try {
        await importEntity.save();
      } catch (e) {
        errorHandler(new ServerErrorException("Can't save import object"));
      }*/
    }
  } else {
    errorHandler(new BadRequestException("Can't save import object"));
  }
}

export function createImportByFromUser(
  errorHandler: NextFunction,
  user: UserRequestContext | undefined,
) {
  if (!user) {
    return errorHandler(
      new MissingParametersException("Missing user for import"),
    );
  }

  return {
    id: user._id,
    nickname: user.nickname,
  };
}

export async function deleteImport(
  errorHandler: NextFunction,
  id: string,
  contributorUser: UserRequestContext | undefined = undefined,
) {
  const importEntity = await findImportByIdSync(errorHandler, id);
  if (!importEntity) {
    errorHandler(
      new ObjectNotFoundException("Can't find import with id " + id),
    );
  } else {
    if (
      checkContributorAuthorized(errorHandler, contributorUser, importEntity)
    ) {
      try {
        await Import.deleteOne({ _id: id });
      } catch (e) {
        errorHandler(new ServerErrorException("Can't delete import"));
      }
    }
  }
}

export function checkContributorAuthorized(
  errorHandler: NextFunction,
  contributorUser: UserRequestContext | undefined,
  importEntity: HydratedDocument<IImport> | undefined | null,
) {
  if (!importEntity) {
    return false;
  }
  if (!contributorUser) {
    return true;
  }

  if (importEntity.ownerId === contributorUser._id.toString()) {
    return true;
  }
  errorHandler(new UnauthorizedException());
  return false;
}
