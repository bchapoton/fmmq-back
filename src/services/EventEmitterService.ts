import {
  getEndGameChatNamespace,
  getRoomChatNamespace,
} from "../socket/NamespaceHelper";

import { PlayerRoomDTO } from "./dto/PlayerRoomDTO";
import { MusicRoomDTO } from "./dto/MusicRoomDTO";
import { socket } from "../main";

export const emitOnEnter = (categoryId: string, player: PlayerRoomDTO) => {
  socket.of(categoryId).emit("ENTER", player);
};

export const emitOnFailed = (
  categoryId: string,
  player: PlayerRoomDTO,
  accuracy: number,
) => {
  socket.of(categoryId).emit("FAILED", {
    playerId: player.id,
    accuracy: accuracy,
  });
};

export type EmitOnGuessedPayloadType = {
  playerId: string;
  points: number;
  found: string | null;
  alreadyFound: string;
  foundEveryThing: boolean;
  trophy?: number;
  music?: {
    title?: string;
    artist?: string;
  } | null;
};

/**
 *
 * @param categoryId string
 * @param player object
 * @param points int
 * @param found string
 * @param alreadyFound string
 * @param trophy int
 * @param music object the found values (artist, title or both)
 * @param foundEveryThing boolean if the user found everything
 */
export const emitOnGuessed = (
  categoryId: string,
  player: PlayerRoomDTO,
  points: number,
  found: string | null,
  alreadyFound: string,
  trophy: number,
  music: {
    title?: string;
    artist?: string;
  } | null,
  foundEveryThing: boolean,
) => {
  const payload: EmitOnGuessedPayloadType = {
    playerId: player.id,
    points: points,
    found: found,
    alreadyFound: alreadyFound,
    foundEveryThing: foundEveryThing,
  };

  if (trophy && (trophy === 1 || trophy === 2 || trophy === 3)) {
    payload.trophy = trophy;
  }

  if (music) {
    payload.music = music;
  }

  socket.of(categoryId).emit("GUESSED", payload);
};

export const emitRoundStarts = (categoryId: string, payload: any) => {
  socket.of(categoryId).emit("ROUND_STARTS", payload);
};

export const emitNewGameStarts = (
  categoryId: string,
  playerNickname: string,
) => {
  socket
    .of(categoryId)
    .emit("NEW_GAME_STARTS", { playerNickname: playerNickname });
};

export type EmitRoundEndsPayloadType = {
  nextFile: string;
  music?: Pick<MusicRoomDTO, "artist" | "title">;
};

export const emitRoundEnds = (
  categoryId: string,
  currentMusicScheme: MusicRoomDTO,
  nextMusicScheme: MusicRoomDTO,
) => {
  const payload: EmitRoundEndsPayloadType = {
    nextFile: nextMusicScheme.file,
  };

  if (currentMusicScheme) {
    payload.music = {
      artist: currentMusicScheme.artist,
      title: currentMusicScheme.title,
    };
  }

  socket.of(categoryId).emit("ROUND_ENDS", payload);
};

export const emitGameEnds = (categoryId: string, gameId: string) => {
  socket.of(categoryId).emit("GAME_ENDS", {
    gameId: gameId,
  });
};

export const emitAlreadyFoundEverything = (
  categoryId: string,
  player: PlayerRoomDTO,
) => {
  socket
    .of(categoryId)
    .emit("ALREADY_FOUND_EVERYTHING", { playerId: player.id });
};

export type EmitMessageInGameChatPayloadType = {
  playerId: string;
  time: number;
  playerNickname: string;
  content: string;
};

export const emitMessageInGameChat = (
  categoryId: string,
  payload: EmitMessageInGameChatPayloadType,
) => {
  socket.of(getRoomChatNamespace(categoryId)).emit("MESSAGE_RECEIVED", payload);
};

export type EmitMessageEndGameChatPayloadType =
  EmitMessageInGameChatPayloadType;

export const emitMessageEndGameChat = (
  categoryId: string,
  payload: EmitMessageInGameChatPayloadType,
) => {
  socket
    .of(getEndGameChatNamespace(categoryId))
    .emit("MESSAGE_RECEIVED", payload);
};

export const emitOperatorMessage = (
  categoryId: string,
  currentIndexFromZero: number,
  artist: string,
  title: string,
) => {
  socket.of(getRoomChatNamespace(categoryId)).emit("MESSAGE_RECEIVED", {
    musicIndex: currentIndexFromZero,
    time: new Date().getTime(),
    artist: artist,
    title: title,
    playerId: "operator",
    playerNickname: "operator",
  });
};
