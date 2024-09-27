import { cacheService } from "./CacheService";
import { createSocketRoom, getSocket } from "../socket/SocketHelper";
import { Category } from "../models/category.model";
import { pickMusics } from "./MusicService";
import { emitOnEnter } from "./EventEmitterService";
import accents from "remove-accents";
import { Request } from "express";
import { PlayerRoomDTO } from "./dto/PlayerRoomDTO";
import { ObjectNotFoundException } from "../exceptions/ObjectNotFoundException";
import { CategoryDTO } from "../routes/dto/CategoryDTO";
import { Room } from "./bean/Room";

const compareAlgo = require("damerau-levenshtein-js");

export const getCurrentRoomPlayers = (
  categoryId: string,
): CategoryDTO["current"] => {
  const game = cacheService.get(categoryId);
  if (game) {
    return {
      playersCount: game.countPlayers(),
      currentMusicCount: game.getCurrentMusicIndexFromZero(),
      totalMusicCount: game.getMusicSchemeLength(),
    };
  }
  return { playersCount: -1 }; // no game start
};

export async function enterRoom(categoryId: string, player: PlayerRoomDTO) {
  const category = await Category.findById(categoryId);
  if (!category) {
    return Promise.reject(new ObjectNotFoundException("Can't find category"));
  }
  let game = cacheService.get(categoryId);
  let playerObject;
  if (game) {
    playerObject = joinRoom(game, player);
  } else {
    game = await createRoom(categoryId, category.label);
    playerObject = joinRoom(game, player);
    game.start(player.nickname);
  }

  // create the socket if don't exists
  createSocketRoom(getSocket(), categoryId);

  let currentMusicInProgress = null;
  if (game.currentMusicStartTimestamp !== null) {
    // if this is set a music is in progress send the data for start playing the music in the middle of it
    const currentMusicPosition = Math.round(
      new Date().getTime() - game.currentMusicStartTimestamp,
    );
    currentMusicInProgress = {
      positionMilliseconds: currentMusicPosition,
      musicInfo: game.buildMusicObjectForClientPlayer(),
    };
  }

  return {
    category: {
      label: category.label,
    },
    playersCount: game.countPlayers(),
    currentMusicIndex: game.getCurrentMusicIndexFromZero(),
    musicsLength: game.getMusicSchemeLength(),
    leaderBoard: game.getLeaderBoard(),
    socketNamespace: categoryId,
    playerToken: playerObject.playerToken,
    playerId: player.id,
    currentMusicInProgress: currentMusicInProgress,
  };
}

/**
 * Create a room from category id
 *
 * @param categoryId
 * @param categoryLabel
 * @return {Promise<Room>}
 */
export async function createRoom(
  categoryId: string,
  categoryLabel: string,
): Promise<Room> {
  const musics = await pickMusics();
  const game = new Room(categoryId, categoryLabel, musics);
  cacheService.setRoom(categoryId, game);
  return game;
}

/**
 * Join the player to the room
 *
 * @param game current Room object
 * @param player the player
 * @return Object The player object
 */
export function joinRoom(game: Room, player: PlayerRoomDTO) {
  const playerObject = game.joinRoom(player);
  emitOnEnter(game.getCategoryId(), player);
  return playerObject;
}

/**
 * Generate player bean from Auth middleware UserContext
 * @param req
 * @return {{score: number, nickname: {minlength: number, maxlength: number, unique: boolean, type: String | StringConstructor, required: boolean}, id: *}|null}
 */
export function getPlayerFromUserContext(
  req: Request,
): PlayerRoomDTO | undefined {
  if (req && req.userContext) {
    return {
      id: req.userContext._id.toString(),
      nickname: req.userContext.nickname,
      score: 0,
      playerToken: "",
    } satisfies PlayerRoomDTO;
  }
  return;
}

/**
 * Remove accents and set to lower case
 *
 * @param element the title or artist
 * @return string the accents free and lower case string
 */
export const sanitizeMusicElement = (element: string) => {
  const elementLowerWithoutAccent = removeAccentToLowerCase(element);
  return clean(elementLowerWithoutAccent);
};

export const sanitizeGuess = (element: string) => {
  return removeAccentToLowerCase(element);
};

export function removeAccentToLowerCase(element: string) {
  return accents.remove(element.trim()).toLowerCase();
}

export function clean(str: string) {
  return cleanForbiddenWords(str, ["feat.", "..."]);
}

export function cleanForbiddenWords(str: string, words: Array<string>) {
  const strArr = str.split(" ");
  const result = [];
  for (let index in strArr) {
    const strItem = strArr[index];
    if (strItem && strItem.length > 1 && !words.includes(strItem)) {
      result.push(strItem);
    }
  }
  let cleaned = result.join(" ");
  if (cleaned.indexOf("(") && cleaned.indexOf(")")) {
    cleaned =
      cleaned.substring(0, cleaned.indexOf("(")) +
      cleaned.substring(cleaned.indexOf(")") + 1);
  }
  if (cleaned.indexOf("[") && cleaned.indexOf("]")) {
    cleaned =
      cleaned.substring(0, cleaned.indexOf("[")) +
      cleaned.substring(cleaned.indexOf("]") + 1);
  }
  return cleaned.trim();
}

export const splitMusicElement = (element: string) => {
  return element.split(" ");
};

/**
 * Compare sanitizedGuessTry
 *
 * @param sanitizedOriginalSplit the original split string array without accents and uppercase
 * @param sanitizedGuessTrySplit the guess try array without accents and uppercase already split by the function splitMusicElement
 * @return {{originalWordFound: [], guessWordFound: []}} original words found in this round and the guess try found in this round
 */
export function compareGuessTry(
  sanitizedOriginalSplit: Array<string>,
  sanitizedGuessTrySplit: Array<string>,
): { originalWordFound: Array<string>; guessWordFound: Array<string> } {
  // allow more error in long word
  const smallWordAllowedDistance = [0, 1];
  const longWordAllowedDistance = [0, 1, 2];

  let originalWordFound: Array<string> = [];
  let guessWordFound: Array<string> = [];
  // copy original array, we will remove on each searched all found elements
  let internalGuessTrySplit = [...sanitizedGuessTrySplit];

  for (let i in sanitizedOriginalSplit) {
    let originalWord = sanitizedOriginalSplit[i] as string;
    const internalOriginalFound = [];
    const internalGuessFound: Array<string> = [];

    for (let j in internalGuessTrySplit) {
      let guessWord = internalGuessTrySplit[j] as string;
      const distance = compareAlgo.distance(originalWord, guessWord);
      let isFound;
      if (originalWord.length < 5) {
        isFound = smallWordAllowedDistance.includes(distance);
      } else {
        isFound = longWordAllowedDistance.includes(distance);
      }
      if (isFound) {
        internalOriginalFound.push(originalWord);
        internalGuessFound.push(guessWord);
        break;
      }
    }
    originalWordFound = originalWordFound.concat(internalOriginalFound);
    guessWordFound = guessWordFound.concat(internalGuessFound);
    // remove all the found words in this iteration
    internalGuessTrySplit = internalGuessTrySplit.filter(
      (item) => !internalGuessFound.includes(item),
    );
    if (internalGuessTrySplit.length === 0) {
      // no more word to search stop here
      break;
    }
  }

  return {
    originalWordFound: originalWordFound,
    guessWordFound: guessWordFound,
  };
}
