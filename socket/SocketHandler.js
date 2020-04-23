const cacheService = require('../services/CacheService');
const {logWarn} = require("../logger/Logger");
const {logInfo} = require("../logger/Logger");
const {emitOnFailed, emitOnGuessed} = require("../services/EventEmitterService");

const socketRoomHandler = (socket, namespace) => {
    logInfo('socket connected on namespace ' + namespace);

    socket.emit('welcome', 'welcome in namespace ' + namespace);

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

exports.socketRoomHandler = socketRoomHandler;