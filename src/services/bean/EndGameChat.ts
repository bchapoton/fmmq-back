import crypto from "crypto";
import { generateCipherKeys } from "../CipherUtils";
import { UserRequestContext } from "../../custom.express";

export class EndGameChat {
  categoryId: string;
  players: Array<any>;

  constructor(categoryId: string) {
    this.categoryId = categoryId;
    this.players = [];
  }

  join(user: UserRequestContext) {
    const index = playerFinder(this.players, user._id);
    if (index !== -1) {
      return this.players[index];
    } else {
      const playerCipher = generateCipherKeys();
      const playerToken = crypto
        .createHash("md5")
        .update(playerCipher.key)
        .digest("hex");

      const playerPayload = {
        id: user._id,
        nickname: user.nickname,
        playerToken: playerToken,
      };
      this.players.push(playerPayload);
      return playerPayload;
    }
  }

  isPlayerAuthenticated(playerId: string, playerToken: string) {
    const index = playerFinderById(this.players, playerId);
    if (index !== -1) {
      if (this.players[index].playerToken === playerToken) {
        return this.players[index];
      }
    }
    return null;
  }

  leave(playerId, playerToken) {
    const player = this.isPlayerAuthenticated(playerId, playerToken);
    if (player) {
      const index = playerFinder(this.players, player.id);
      if (index !== -1) {
        this.players.splice(index, 1);
      }
    }
  }
}

const playerFinder = (array, searchedId) => {
  return playerFinderById(array, searchedId);
};

const playerFinderById = (array, searchedId) => {
  return array.findIndex((item) => item.id === searchedId);
};
