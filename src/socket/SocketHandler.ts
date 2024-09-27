import { cacheService } from "../services/CacheService";
import {
  emitMessageEndGameChat,
  emitMessageInGameChat,
} from "../services/EventEmitterService";
import { logInfo, logWarn } from "../logger/Logger";
import { SocketHandlerType } from "./SocketHelper";

export const socketRoomHandler: SocketHandlerType = (socket, namespace) => {
  logInfo("socket connected on namespace " + namespace);

  socket.on("GUESS", (payload) => {
    if (payload && payload.playerId && payload.playerToken && payload.value) {
      const room = cacheService.findRoom(namespace);
      if (room) {
        const currentPlayer = room.isPlayerAuthenticated(
          payload.playerId,
          payload.playerToken,
        );
        if (currentPlayer) {
          room.guess(currentPlayer, payload.value);
        } else {
          logWarn(
            `Unauthorized attempt / player id : ${payload.playerId} / player token : ${payload.playerToken}`,
          );
        }
      } else {
        logWarn("cant find the room");
      }
    } else {
      logWarn("Bad event");
    }
  });

  socket.on("disconnect", (data) => {
    logInfo("Client disconnected : " + data + " from namespace " + namespace);
  });
};

export const socketInGameChatHandler: SocketHandlerType = (
  socket,
  namespace,
) => {
  logInfo("socket connected on namespace " + namespace);

  socket.on("SEND_MESSAGE", (payload) => {
    if (
      payload &&
      payload.categoryId &&
      payload.playerId &&
      payload.playerToken &&
      payload.time &&
      payload.message
    ) {
      const room = cacheService.findRoom(payload.categoryId);
      if (room) {
        const currentPlayer = room.isPlayerAuthenticated(
          payload.playerId,
          payload.playerToken,
        );
        if (currentPlayer) {
          const eventPayload = {
            playerId: currentPlayer.id,
            time: payload.time,
            playerNickname: currentPlayer.nickname,
            content: payload.message,
          };
          emitMessageInGameChat(payload.categoryId, eventPayload);
        } else {
          logWarn(
            `Unauthorized chat message attempt / player id : ${payload.playerId} / player token : ${payload.playerToken}`,
          );
        }
      } else {
        logWarn("chat message cant find the room");
      }
    } else {
      logWarn("chat message bad event");
    }
  });

  socket.on("disconnect", (data) => {
    logInfo("Client disconnected : " + data + " from namespace " + namespace);
  });
};

export const socketEndGameChatHandler: SocketHandlerType = (
  socket,
  namespace,
) => {
  logInfo("socket connected on namespace " + namespace);

  socket.on("SEND_MESSAGE", (payload: any) => {
    if (
      payload &&
      payload.categoryId &&
      payload.playerId &&
      payload.playerToken &&
      payload.time &&
      payload.message
    ) {
      const chat = cacheService.findChat(payload.categoryId);
      if (chat) {
        const currentPlayer = chat.isPlayerAuthenticated(
          payload.playerId,
          payload.playerToken,
        );
        if (currentPlayer) {
          const eventPayload = {
            playerId: currentPlayer.id,
            time: payload.time,
            playerNickname: currentPlayer.nickname,
            content: payload.message,
          };
          emitMessageEndGameChat(payload.categoryId, eventPayload);
        } else {
          logWarn(
            `Unauthorized chat message attempt / player id : ${payload.playerId} / player token : ${payload.playerToken}`,
          );
        }
      } else {
        logWarn("chat message cant find the room");
      }
    } else {
      logWarn("chat message bad event");
    }
  });

  socket.on("disconnect", (data) => {
    logInfo("Client disconnected : " + data + " from namespace " + namespace);
  });
};
