const cacheService = require('../services/CacheService');
const {emitOnFailed, emitOnGuessed} = require("../services/EventEmitterService");

const socketRoomHandler = (socket, namespace) => {
    console.log('socket connected on namespace ' + namespace);

    socket.emit('welcome', 'welcome in namespace ' + namespace);

    socket.on('GUESS', payload => {
        if (payload && payload.playerId && payload.playerToken && payload.value) {
            const room = cacheService.findRoom(namespace);
            if (room) {
                const currentPlayer = room.isPlayerAuthenticated(payload.playerId, payload.playerToken);
                if (currentPlayer) {
                    room.guess(currentPlayer, payload.value);
                } else {
                    console.log(`Unauthorized attempt / player id : ${payload.playerId} / player token : ${payload.playerToken}`);
                }
            } else {
                console.log('cant find the room');
            }
        } else {
            console.log('Bad event');
        }
    });

    socket.on("disconnect", (data) => {
        console.log("Client disconnected : " + data + ' from namespace ' + namespace);
    });
};

exports.socketRoomHandler = socketRoomHandler;