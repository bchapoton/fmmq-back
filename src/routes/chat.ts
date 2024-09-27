import express from "express";
import { cacheService } from "../services/CacheService";
import { createSocketChatEndGame, getSocket } from "../socket/SocketHelper";
import { EndGameChat } from "../services/bean/EndGameChat";
import { UnauthorizedException } from "../exceptions/UnauthorizedException";

export const chatRouter = express.Router();

chatRouter.post("/:categoryId/join", async (req, res, next) => {
  const categoryId = req.params.categoryId;
  const user = req.userContext;
  if (!user) {
    next(new UnauthorizedException());
  } else {
    let chat = cacheService.findChat(categoryId);
    let player;
    if (chat) {
      player = chat.join(user);
    } else {
      const chat = new EndGameChat(categoryId);
      cacheService.setChat(categoryId, chat);
      createSocketChatEndGame(getSocket(), categoryId);
      player = chat.join(user);
    }
    res.json(player);
  }
});
