import { IMusic, Music } from "../models/music.model";
import { categoryService } from "./CategoryService";
import { ServerErrorException } from "../exceptions/ServerErrorException";
import { MusicRoomDTO } from "./dto/MusicRoomDTO";
import { HydratedDocument, RootFilterQuery } from "mongoose";
import { logError } from "../logger/Logger";
import { NextFunction } from "express";

const musicPickStep = 3;

export const pickMusics = async (count = 15) => {
  const musics: Array<HydratedDocument<IMusic>> = await pickRangedMusic(count);
  const updatedMusics: Array<HydratedDocument<IMusic>> = [];
  const results: Array<MusicRoomDTO> = [];
  musics.forEach((music) => {
    results.push({
      id: music._id.toString(),
      artist: music.artist,
      artistSanitized: music.artistSanitized,
      title: music.title,
      titleSanitized: music.titleSanitized,
      file: music.file,
    });
    // randomize new int to improve random factor when pick music
    music.randomInt = getMusicRandomInt();
    updatedMusics.push(music);
    music.save();
  });
  try {
    await Music.bulkSave(updatedMusics);
  } catch (exception) {
    logError("Can't save bulked picked music");
    logError(exception + "");
  }

  return results;
};

export async function pickRangedMusic(
  count: number,
): Promise<Array<HydratedDocument<IMusic>>> {
  const totalMusicCount = await Music.countDocuments();
  const sorter = getRandomSortDirection() + "randomInt";
  let picked: Array<HydratedDocument<IMusic>> = [];
  while (picked.length < count) {
    const skip = getRandomInt(0, totalMusicCount - musicPickStep);
    const musics = await Music.find()
      .sort(sorter)
      .skip(skip)
      .limit(musicPickStep);
    picked = addIfNotAlreadyPicked(picked, musics, count);
  }
  return picked;
}

function addIfNotAlreadyPicked(
  array: Array<HydratedDocument<IMusic>>,
  values: Array<HydratedDocument<IMusic>>,
  count: number,
): Array<HydratedDocument<IMusic>> {
  const results = [...array];
  for (let index in values) {
    const value = values[index];
    if (
      value &&
      array.filter((music) => music._id.toString() === value._id.toString())
        .length === 0
    ) {
      if (results.length < count) {
        results.push(value);
      } else {
        break;
      }
    }
  }
  return results;
}

export function getMusicRandomInt() {
  return getRandomInt(0, 10000);
}

function getRandomInt(min: number, max: number) {
  return parseInt(String(Math.random() * (max - min) + min));
}

function getRandomSortDirection() {
  return Math.random() < 0.5 ? "-" : "";
}

export async function deleteMusicByImportId(importEntityId: string) {
  await Music.deleteMany({ importObjectId: importEntityId });
}

export function countMusicsByCategoryId(
  errorHandlers: NextFunction,
  categoryId: string,
  success: (count: number) => void,
) {
  categoryService
    .findById(categoryId)
    .then((category) => {
      let filters: RootFilterQuery<IMusic> = {};
      if (!category.allMusicsOnServer) {
        filters = { categoryId };
      }
      Music.countDocuments(filters)
        .then(success)
        .catch((error) =>
          errorHandlers(new ServerErrorException(error.toString())),
        );
    })
    .catch((error) =>
      errorHandlers(new ServerErrorException(error.toString())),
    );
}
