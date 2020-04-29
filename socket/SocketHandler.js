const cacheService = require('../services/CacheService');
const {emitMessageEndGameChat} = require("../services/EventEmitterService");
const {emitMessageInGameChat} = require("../services/EventEmitterService");
const {logWarn} = require("../logger/Logger");
const {logInfo} = require("../logger/Logger");

const socketRoomHandler = (socket, namespace) => {
    logInfo('socket connected on namespace ' + namespace);

    socket.on('GUESS', payload => {
        if (payload && payload.playerId && payload.playerToken && payload.value) {
            const room = cacheService.findRoom(namespace);
            if (room) {
                const currentPlayer = room.isPlayerAuthenticated(payload.playerId, payload.playerToken);
                if (currentPlayer) {
                    room.guess(currentPlayer, payload.value);
                } else {
                    logWarn(`Unauthorized attempt / player id : ${payload.playerId} / player token : ${payload.playerToken}`);
                }
            } else {
                logWarn('cant find the room');
            }
        } else {
            logWarn('Bad event');
        }
    });

    socket.on("disconnect", (data) => {
        logInfo("Client disconnected : " + data + ' from namespace ' + namespace);
    });
};

const socketInGameChatHandler = (socket, namespace) => {
    logInfo('socket connected on namespace ' + namespace);

    socket.on('SEND_MESSAGE', payload => {
        if (payload && payload.categoryId && payload.playerId && payload.playerToken && payload.time && payload.message) {
            const room = cacheService.findRoom(payload.categoryId);
            if (room) {
                const currentPlayer = room.isPlayerAuthenticated(payload.playerId, payload.playerToken);
                if (currentPlayer) {
                    const eventPayload = {
                        playerId: currentPlayer.id,
                        time: payload.time,
                        playerNickname: currentPlayer.nickname,
                        content: payload.message
                    };
                    emitMessageInGameChat(payload.categoryId, eventPayload);
                } else {
                    logWarn(`Unauthorized chat message attempt / player id : ${payload.playerId} / player token : ${payload.playerToken}`);
                }
            } else {
                logWarn('chat message cant find the room');
            }
        } else {
            logWarn('chat message bad event');
        }
    });

    socket.on("disconnect", (data) => {
        logInfo("Client disconnected : " + data + ' from namespace ' + namespace);
    });
};

const socketEndGameChatHandler = (socket, namespace) => {
    logInfo('socket connected on namespace ' + namespace);

    socket.on('SEND_MESSAGE', payload => {
        if (payload && payload.categoryId && payload.playerId && payload.playerToken && payload.time && payload.message) {
            const chat = cacheService.findChat(payload.categoryId);
            if (chat) {
                const currentPlayer = chat.isPlayerAuthenticated(payload.playerId, payload.playerToken);
                if (currentPlayer) {
                    const eventPayload = {
                        playerId: currentPlayer.id,
                        time: payload.time,
                        playerNickname: currentPlayer.nickname,
                        content: payload.message
                    };
                    emitMessageEndGameChat(payload.categoryId, eventPayload);
                } else {
                    logWarn(`Unauthorized chat message attempt / player id : ${payload.playerId} / player token : ${payload.playerToken}`);
                }
            } else {
                logWarn('chat message cant find the room');
            }
        } else {
            logWarn('chat message bad event');
        }
    });

    socket.on("disconnect", (data) => {
        logInfo("Client disconnected : " + data + ' from namespace ' + namespace);
    });
};

exports.socketRoomHandler = socketRoomHandler;
exports.socketInGameChatHandler = socketInGameChatHandler;
exports.socketEndGameChatHandler = socketEndGameChatHandler;