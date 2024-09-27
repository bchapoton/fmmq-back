import { sanitizeArtist, sanitizeTitle } from "./ImportService";
import { getMusicRandomInt } from "./MusicService";
import { Music } from "../models/music.model";
import { logError } from "../logger/Logger";

/**
 * Re sanitize all music in db
 * @return number handled musics
 */
export const reSanitizeDB = async function () {
  let count = 0;
  let errorsCount = 0;
  let errors: Array<{
    id: string;
    artist: string;
    title: string;
    error: string;
  }> = [];
  const musics = await Music.find().exec();
  musics.forEach((music) => {
    if (music.artist && music.title) {
      try {
        // @ts-ignore
        music.artistSanitized = sanitizeArtist(music.artist);
        // @ts-ignore
        music.titleSanitized = sanitizeTitle(music.title);
        music.randomInt = getMusicRandomInt();
        music.save().catch((e) => {
          errorsCount++;
          errors.push({
            id: music._id.toString(),
            artist: music.artist,
            title: music.title,
            error: e.toString(),
          });
        });
        count++;
      } catch (e) {
        errorsCount++;
        errors.push({
          id: music._id.toString(),
          artist: music.artist,
          title: music.title,
          error: e?.toString() ?? "",
        });
      }
    }
  });

  return {
    count: count,
    errorsCount: errorsCount,
    errors: errors,
  };
};

export async function getMusicDuplicates() {
  let musicCount = 0;
  let musicsDuplicates: {
    [filePath: string]: {
      metadata: string;
      count: number;
      ids: Array<string>;
    };
  } = {};
  const musics = await Music.find().exec();
  musics.forEach((music) => {
    musicCount++;
    const filePath = music.file;
    if (!musicsDuplicates[filePath]) {
      const ids = [];
      ids.push(music._id.toString());
      musicsDuplicates[filePath] = {
        metadata: `${music.artist} - ${music.title}`,
        count: 1,
        ids: ids,
      };
    } else {
      musicsDuplicates[filePath].count = musicsDuplicates[filePath].count + 1;
      musicsDuplicates[filePath].ids.push(music._id.toString());
    }
  });

  const duplicates = [];
  for (let index in musicsDuplicates) {
    if (musicsDuplicates[index] && musicsDuplicates[index].count > 1) {
      duplicates.push(musicsDuplicates[index]);
    }
  }

  return {
    musicOnServer: musicCount,
    duplicatesCount: duplicates.length,
    duplicates: duplicates,
  };
}

export async function delMusicDuplicates() {
  const results = [];
  let deletedCount = 0;
  const duplicates = await getMusicDuplicates();
  for (let index in duplicates.duplicates) {
    const duplicate = duplicates.duplicates[index];
    if (duplicate && duplicate.ids.length > 1) {
      const idsToDelete = [...duplicate.ids];
      idsToDelete.pop();
      for (let j in idsToDelete) {
        deletedCount++;
        Music.findByIdAndDelete(idsToDelete[j])
          .exec()
          .catch((e) => logError(e));
      }
      results.push({
        metadata: duplicate.metadata,
        idsDeleted: idsToDelete,
      });
    }
  }

  return {
    musicOnServer: duplicates.musicOnServer,
    duplicatesCount: duplicates.duplicatesCount,
    deletedCount: deletedCount,
    deleted: results,
  };
}
