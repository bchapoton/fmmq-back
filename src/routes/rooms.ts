import express from "express";
import { countMusicsByCategoryId } from "../services/MusicService";
import {
  enterRoom,
  getCurrentRoomPlayers,
  getPlayerFromUserContext,
} from "../services/GameService";
import { Category } from "../models/category.model";
import { cacheService } from "../services/CacheService";
import { UnauthorizedException } from "../exceptions/UnauthorizedException";
import { CategoryDTO } from "./dto/CategoryDTO";

export const roomsRouter = express.Router();

roomsRouter.get("/categories", async (_, res) => {
  const categories = await Category.find().sort("order");
  const results: Array<CategoryDTO> = [];
  categories.forEach((category) => {
    results.push(
      Object.assign(
        {},
        {
          _id: category._id.toString(),
          label: category.label,
          description: category.description,
        },
        { current: getCurrentRoomPlayers(category._id.toString()) },
      ),
    );
  });
  res.json(results);
});

roomsRouter.post("/:categoryId/join", async (req, res, next) => {
  const categoryId = req.params.categoryId;
  const player = getPlayerFromUserContext(req);
  if (!player) {
    next(new UnauthorizedException());
  } else {
    const roomInfo = await enterRoom(categoryId, player);
    res.json(roomInfo);
  }
});

roomsRouter.get("/:categoryId/musics/count", (req, res, next) => {
  const categoryId = req.params.categoryId;
  const countCached = cacheService.getCategoryMusicsCount(categoryId);
  if (countCached !== null) {
    res.json({ count: countCached });
  } else {
    countMusicsByCategoryId(next, categoryId, (count) => {
      cacheService.setCategoryMusicsCount(categoryId, count);
      res.json({ count: count });
    });
  }
});
