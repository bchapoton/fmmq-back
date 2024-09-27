import express from "express";
import { getPagerFromRequest } from "../services/NetworkUtils";
import { Game, IGame } from "../models/game.model";

export const gamesRouter = express.Router();

type GameOverDTO = Omit<IGame, "date"> & { date: number };

gamesRouter.get("/over/:gameId", (req, res, next) => {
  const gameId = req.params.gameId;
  Game.findById(gameId).then((gameObject) => {
    if (gameObject) {
      const gameDTO: GameOverDTO = {
        categoryId: gameObject.categoryId,
        categoryLabel: gameObject.categoryLabel,
        musicScheme: gameObject.musicScheme,
        leaderBoard: gameObject.leaderBoard,
        podium: gameObject.podium,
        date: gameObject.date.getTime(),
      };

      res.send(gameDTO);
    } else {
      res.status(404).send();
    }
  });
});

type GamePodiumDTO = {
  id: string;
  category: string;
  date: number;
  podium: IGame["podium"];
};

gamesRouter.get("/podiums", (req, res, next) => {
  const pager = getPagerFromRequest(req);
  Game.find()
    .skip(pager.start)
    .limit(pager.limit)
    .sort("-date")
    .then((games) => {
      const result: Array<GamePodiumDTO> = [];
      games.forEach((game) => {
        result.push({
          id: game._id.toString(),
          category: game.categoryLabel,
          date: game.date.getTime(),
          podium: game.podium,
        });
      });
      res.json(result);
    })
    .catch(next);
});
