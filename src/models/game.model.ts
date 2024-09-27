import { model, Schema } from "mongoose";

export interface IGameLeaderBoard {
  id: string;
  nickname: string;
  score: number;
}

export interface IGameMusicScheme {
  id: string;
  artist: string;
  title: string;
}

export interface IGame {
  categoryLabel: string;
  categoryId: string;
  podium: Array<IGameLeaderBoard>;
  leaderBoard: Array<IGameLeaderBoard>;
  musicScheme: Array<IGameMusicScheme>;
  date: Date;
}

const GameSchema = new Schema<IGame>({
  categoryLabel: {
    type: String,
    required: true,
  },
  categoryId: {
    type: String,
    required: true,
  },
  podium: {
    type: [
      {
        id: {
          type: String,
          required: true,
        },
        nickname: {
          type: String,
          required: true,
        },
        score: {
          type: Number,
          required: true,
        },
      },
    ],
    required: true,
  },
  leaderBoard: {
    type: [
      {
        id: {
          type: String,
          required: true,
        },
        nickname: {
          type: String,
          required: true,
        },
        score: {
          type: Number,
          required: true,
        },
      },
    ],
    required: true,
  },
  musicScheme: {
    type: [
      {
        id: {
          type: String,
          required: true,
        },
        artist: {
          type: String,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
      },
    ],
    required: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
});

export const Game = model<IGame>("Game", GameSchema);
