import crypto from "crypto";
import { cacheService } from "../CacheService";
import {
  emitAlreadyFoundEverything,
  emitGameEnds,
  emitNewGameStarts,
  emitOnFailed,
  emitOnGuessed,
  emitOperatorMessage,
  emitRoundEnds,
  emitRoundStarts,
} from "../EventEmitterService";
import {
  compareGuessTry,
  sanitizeGuess,
  splitMusicElement,
} from "../GameService";
import { logDebug } from "../../logger/Logger";
import {
  Game,
  IGameLeaderBoard,
  IGameMusicScheme,
} from "../../models/game.model";
import { generateCipherKeys } from "../CipherUtils";
import { MusicRoomDTO } from "../dto/MusicRoomDTO";
import {
  PlayerCurrentMusicValuesDTO,
  PlayerRoomDTO,
} from "../dto/PlayerRoomDTO";
import { ServerErrorException } from "../../exceptions/ServerErrorException";

/**
 * Room handle players array, all operation on the array will be made by splice function,
 * because we use a mutable array stored in memory cache
 */
export class Room {
  categoryId: string;
  categoryLabel: string;
  musicScheme: Array<MusicRoomDTO>;
  currentMusicIndex: number;
  players: Array<PlayerRoomDTO>;
  currentMusicTrophy: Array<any>;
  onAir: boolean;
  currentMusicStartTimestamp: any;
  timeoutRef: any;

  constructor(
    categoryId: string,
    categoryLabel: string,
    musics: Array<MusicRoomDTO>,
  ) {
    this.categoryId = categoryId;
    this.categoryLabel = categoryLabel;
    this.musicScheme = musics; // all the designated music for the game, random get when creating the room
    this.currentMusicIndex = -1; // the current music id (from musicScheme array) in the game
    this.players = [];
    this.currentMusicTrophy = [];
    this.onAir = false; // if true a music to guess is in progress
    this.currentMusicStartTimestamp = null; // store when the start current music event was sent, use to calculate when player come in the middle of a music
    this.timeoutRef = null;
  }

  getCategoryId() {
    return this.categoryId;
  }

  countPlayers() {
    return this.players.length;
  }

  getCurrentMusicIndexFromZero() {
    return this.currentMusicIndex + 1;
  }

  getMusicSchemeLength() {
    return this.musicScheme.length;
  }

  getLeaderBoard() {
    const leaderBoard: Array<IGameLeaderBoard> = [];
    this.players.forEach((player) => {
      leaderBoard.push({
        id: player.id,
        nickname: player.nickname,
        score: player.score,
      });
    });
    return leaderBoard;
  }

  /**
   * Join the player to the room
   *
   * @param user the player
   * @return Object the player object
   */
  joinRoom(user: PlayerRoomDTO): PlayerRoomDTO {
    const index = playerFinder(this.players, user);
    if (index === -1) {
      const playerCipher = generateCipherKeys();
      const playerToken = crypto
        .createHash("md5")
        .update(playerCipher.key)
        .digest("hex");
      const playerObject: PlayerRoomDTO = {
        id: user.id,
        playerToken: playerToken,
        nickname: user.nickname,
        score: 0,
        previousMusicIndexFound: -1, // the previous index found, useful to handle combo point when previous music was found
        currentMusicValues: { artist: [], title: [] }, // hold the splitted array of the artist and the music searched
      };
      this.players.push(playerObject);
      return playerObject;
    } else {
      return this.players[index] as PlayerRoomDTO;
    }
  }

  isPlayerAuthenticated(playerId: string, playerToken: string) {
    const index = playerFinderById(this.players, playerId);
    if (index !== -1) {
      if (
        this.players[index] &&
        this.players[index].playerToken === playerToken
      ) {
        return this.players[index];
      }
    }
    return null;
  }

  addPoint(player: PlayerRoomDTO, point: number) {
    const index = playerFinder(this.players, player);
    if (index > -1 && this.players[index]) {
      this.players[index].score = this.players[index].score + point;
    }
  }

  findBoth(player: PlayerRoomDTO) {
    const index = playerFinder(this.players, player);
    if (index > -1 && this.players[index]) {
      this.players[index].previousMusicIndexFound = this.currentMusicIndex;
    }
  }

  hasFoundPreviousMusic(player: PlayerRoomDTO) {
    const index = playerFinder(this.players, player);
    if (index > -1 && this.players[index]) {
      return (
        this.players[index].previousMusicIndexFound ===
        this.currentMusicIndex - 1
      );
    }
    return false;
  }

  guess(player: PlayerRoomDTO, str: string) {
    if (!this.onAir) {
      return; // no music to find yet
    }

    if (str) {
      const index = playerFinder(this.players, player);
      if (
        index > -1 &&
        this.players[index] &&
        this.players[index].currentMusicValues
      ) {
        if (
          this.players[index].currentMusicValues.artist.length === 0 &&
          this.players[index].currentMusicValues.title.length === 0
        ) {
          // already found everything
          emitAlreadyFoundEverything(this.getCategoryId(), player);
          return;
        }

        let guessTryArray = splitMusicElement(sanitizeGuess(str));
        logDebug("-----TRY");
        logDebug(guessTryArray);
        logDebug(
          "current player artist : " +
            this.players[index].currentMusicValues.artist,
        );
        logDebug(
          "current player title : " +
            this.players[index].currentMusicValues.title,
        );

        const stillToFindInArtistLength =
          this.players[index].currentMusicValues.artist.length;
        const stillToFindInTitleLength =
          this.players[index].currentMusicValues.title.length;

        let alreadyFound = "NONE";
        let foundThisRound: string | null = null;
        let foundArtist = null;
        let foundTitle = null;
        let currentArtistValues = this.players[index].currentMusicValues.artist;
        if (currentArtistValues.length > 0) {
          const { originalWordFound, guessWordFound } = compareGuessTry(
            currentArtistValues,
            guessTryArray,
          );
          logDebug("after artist original found : " + originalWordFound);
          logDebug("after artist try found : " + guessWordFound);
          // remove found words for the title try
          if (guessWordFound.length > 0) {
            guessTryArray = guessTryArray.filter(
              (item) => !guessWordFound.includes(item),
            );
          }
          this.players[index].currentMusicValues.artist =
            currentArtistValues.filter(
              (item) => !originalWordFound.includes(item),
            );
          foundArtist =
            this.players[index].currentMusicValues.artist.length === 0;
          foundThisRound = foundArtist ? "ARTIST" : null;
        } else {
          alreadyFound = "ARTIST";
        }
        logDebug("foundThisRound : " + foundThisRound);

        let currentTitleValues = this.players[index].currentMusicValues.title;
        if (currentTitleValues.length > 0) {
          const { originalWordFound, guessWordFound } = compareGuessTry(
            currentTitleValues,
            guessTryArray,
          );
          this.players[index].currentMusicValues.title =
            currentTitleValues.filter(
              (item) => !originalWordFound.includes(item),
            );
          foundTitle =
            this.players[index].currentMusicValues.title.length === 0;
          foundThisRound = foundTitle
            ? foundThisRound === "ARTIST"
              ? "BOTH"
              : "TITLE"
            : foundThisRound;
          logDebug("after artist original found : " + originalWordFound);
          logDebug("after artist try found" + guessWordFound);
        } else {
          alreadyFound = "TITLE";
        }
        logDebug("foundThisRound : " + foundThisRound);
        logDebug("alreadyFound : " + alreadyFound);

        if (foundThisRound === null) {
          const stillToFindInArtistAfterGuessLength =
            this.players[index].currentMusicValues.artist.length;
          const stillToFindInTitleAfterGuessLength =
            this.players[index].currentMusicValues.title.length;

          let artistAccuracy = 0;
          if (stillToFindInArtistLength !== 0)
            artistAccuracy =
              (stillToFindInArtistLength -
                stillToFindInArtistAfterGuessLength) /
              stillToFindInArtistLength;
          let titleAccuracy = 0;
          if (stillToFindInTitleLength !== 0)
            titleAccuracy =
              (stillToFindInTitleLength - stillToFindInTitleAfterGuessLength) /
              stillToFindInTitleLength;
          logDebug(Math.max(artistAccuracy, titleAccuracy));
          emitOnFailed(
            this.getCategoryId(),
            player,
            Math.max(artistAccuracy, titleAccuracy),
          );
        } else {
          const currentMusicScheme = this.getCurrentMusicFromScheme();
          let musicObjectFound: {
            title?: string;
            artist?: string;
          } | null = null;
          let points = 0;
          if (currentMusicScheme) {
            if (foundThisRound === "BOTH") {
              points = 2;
              musicObjectFound = {
                title: currentMusicScheme.title,
                artist: currentMusicScheme.artist,
              };
            } else if (foundThisRound === "ARTIST") {
              points = 1;
              musicObjectFound = {
                artist: currentMusicScheme.artist,
              };
            } else if (foundThisRound === "TITLE") {
              points = 1;
              musicObjectFound = {
                title: currentMusicScheme.title,
              };
            }
          }

          let foundEveryThing = false;
          let trophy = 0;
          if (
            this.players[index].currentMusicValues &&
            this.players[index].currentMusicValues.artist.length === 0 &&
            this.players[index].currentMusicValues.title.length === 0
          ) {
            foundEveryThing = true;
            // user found everything handle trophy and previous music index
            if (this.hasFoundPreviousMusic(player)) {
              points += 1; // combo found the previous music
            }
            this.findBoth(player);

            if (this.currentMusicTrophy.length <= 3) {
              this.currentMusicTrophy.push(player.id);
              trophy = this.currentMusicTrophy.length;
              if (trophy === 1) {
                points += 3;
              } else if (trophy === 2) {
                points += 2;
              } else if (trophy === 3) {
                points += 1;
              }
            }
          }
          logDebug({
            points,
            foundThisRound,
            alreadyFound,
            trophy,
            musicObjectFound,
          });
          if (points > 0) {
            this.addPoint(player, points);
            emitOnGuessed(
              this.getCategoryId(),
              player,
              points,
              foundThisRound,
              alreadyFound,
              trophy,
              musicObjectFound,
              foundEveryThing,
            );
          }
        }
      }
    }
  }

  /**
   * Start the game for this room
   * @param nickname
   */
  start(nickname: string) {
    if (this.currentMusicIndex === -1) {
      emitNewGameStarts(this.getCategoryId(), nickname);
      this.endCurrentMusic(10000);
    }
  }

  startCurrentMusic() {
    this.onAir = true;
    if (this.timeoutRef) {
      clearTimeout(this.timeoutRef);
    }

    const currentMusicScheme = this.musicScheme[this.currentMusicIndex];
    if (!currentMusicScheme) {
      throw new ServerErrorException();
    }

    // clean players music scheme to find
    const nexMusicScheme = splitCurrentMusicScheme(currentMusicScheme);
    for (let playerIndex in this.players) {
      if (this.players[playerIndex]) {
        this.players[playerIndex].currentMusicValues =
          playerCurrentMusicInitialState(nexMusicScheme);
      }
    }

    emitRoundStarts(
      this.getCategoryId(),
      this.buildMusicObjectForClientPlayer(),
    );
    this.currentMusicStartTimestamp = new Date().getTime();
    const _self = this;
    this.timeoutRef = setTimeout(() => {
      _self.endCurrentMusic();
    }, 30500); // add 500 ms to the timeout for the loading time
  }

  buildMusicObjectForClientPlayer() {
    const currentMusicScheme = this.getCurrentMusicFromScheme();
    if (currentMusicScheme) {
      return {
        fileUrl: currentMusicScheme.file,
        currentMusicIndexDisplayed: this.getCurrentMusicIndexFromZero(),
      };
    } else {
      return {};
    }
  }

  async endCurrentMusic(pauseTimerMilliseconds = 5000) {
    this.onAir = false;
    this.currentMusicStartTimestamp = null;
    this.currentMusicTrophy = [];
    let previousMusicScheme;
    let previousMusicIndex = this.currentMusicIndex;
    if (this.currentMusicIndex > -1) {
      previousMusicScheme = this.musicScheme[this.currentMusicIndex];
    }
    this.currentMusicIndex = this.currentMusicIndex + 1;

    if (this.timeoutRef) {
      clearTimeout(this.timeoutRef);
    }

    if (this.currentMusicIndex >= this.musicScheme.length) {
      // game is over
      const gameMusicScheme: Array<IGameMusicScheme> = [];
      this.musicScheme.forEach((music) => {
        gameMusicScheme.push({
          id: music.id,
          artist: music.artist,
          title: music.title,
        });
      });

      const sortedPlayers = playersSorter(this.players);
      const podium: Array<IGameLeaderBoard> = [];
      const leaderBoard: Array<IGameLeaderBoard> = [];
      sortedPlayers.forEach((player) => {
        const playerToStore = {
          id: player.id,
          nickname: player.nickname,
          score: player.score,
        };

        if (podium.length <= 3) {
          podium.push(playerToStore);
        }
        leaderBoard.push(playerToStore);
      });

      // clean the game in cache
      cacheService.deleteRoom(this.getCategoryId());

      const game = new Game({
        categoryId: this.getCategoryId(),
        categoryLabel: this.categoryLabel,
        musicScheme: gameMusicScheme,
        leaderBoard: leaderBoard,
        podium: podium,
        date: new Date(),
      });
      await game.save();

      emitGameEnds(this.getCategoryId(), game._id.toString());
    } else {
      const nexMusicScheme = this.musicScheme[
        this.currentMusicIndex
      ] as MusicRoomDTO;
      if (previousMusicScheme) {
        // emit only if there was a music before, otherwise it's a game start !
        emitRoundEnds(
          this.getCategoryId(),
          previousMusicScheme,
          nexMusicScheme,
        );
        emitOperatorMessage(
          this.getCategoryId(),
          previousMusicIndex + 1,
          previousMusicScheme.artist,
          previousMusicScheme.title,
        );
      }
      const _self = this;
      this.timeoutRef = setTimeout(() => {
        _self.startCurrentMusic();
      }, pauseTimerMilliseconds);
    }
  }

  getCurrentMusicFromScheme() {
    if (this.currentMusicIndex > -1)
      return this.musicScheme[this.currentMusicIndex];
    else return undefined;
  }

  toJSON() {
    return {
      categoryId: this.categoryId,
      categoryLabel: this.categoryLabel,
      musicScheme: this.musicScheme,
      currentMusicIndex: this.currentMusicIndex,
      players: this.players,
      currentMusicTrophy: this.currentMusicTrophy,
      onAir: this.onAir,
    };
  }
}

const playerFinder = (array: Array<PlayerRoomDTO>, searched: PlayerRoomDTO) => {
  return playerFinderById(array, searched.id);
};

const playerFinderById = (array: Array<PlayerRoomDTO>, searchedId: string) => {
  return array.findIndex((item) => item.id === searchedId);
};

const splitCurrentMusicScheme = (
  currentMusicScheme: MusicRoomDTO,
): PlayerCurrentMusicValuesDTO => {
  return {
    artist: currentMusicScheme.artistSanitized.split(" "),
    title: currentMusicScheme.titleSanitized.split(" "),
  };
};

const playerCurrentMusicInitialState = (
  currentMusicScheme: PlayerCurrentMusicValuesDTO,
): PlayerCurrentMusicValuesDTO => {
  return {
    artist: [...currentMusicScheme.artist],
    title: [...currentMusicScheme.title],
  };
};

const playersSorter = (players: Array<PlayerRoomDTO>): Array<PlayerRoomDTO> => {
  if (!players || players.length === 0) {
    return [];
  }

  return players.slice().sort((item1, item2) => {
    const score1 = item1.score ? item1.score : 0;
    const score2 = item2.score ? item2.score : 0;
    return (score1 - score2) * -1; // desc sorting
  });
};
