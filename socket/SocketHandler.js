const cacheService = require('../services/CacheService');
const {emitOnFailed, emitOnGuessed} = require("../services/EventEmitterService");

const socketRoomHandler = (socket, namespace) => {
    console.log('socket connected on namespace ' + namespace);

    socket.emit('welcome', 'welcome in namespace ' + namespace);
    socket.on('client', data => {
        console.log('[NS:' + namespace + '] client event' + data);
        socket.emit('try', 'reçu');
    });

    socket.on('GUESS', payload => {
        if (payload && payload.playerId && payload.playerToken && payload.value) {
            const room = cacheService.findRoom(namespace);
            if (room) {
                const currentPlayer = room.isPlayerAuthenticated(payload.playerId, payload.playerToken);
                if (currentPlayer) {
                    if(payload.value === 'artist') {
                        emitOnGuessed(namespace,
                            currentPlayer,
                            1,
                            'ARTIST',
                            '',
                            1);
                    } else if(payload.value === 'title') {
                        emitOnGuessed(namespace,
                            currentPlayer,
                            1,
                            'TITLE',
                            '',
                            1);
                    } else if(payload.value === 'both') {
                        emitOnGuessed(namespace,
                            currentPlayer,
                            3,
                            'BOTH',
                            '',
                            1);
                    }else {
                        emitOnFailed(namespace, currentPlayer, 0.8)
                    }
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
        // const {deleteNamespace} = require("./SocketHelper");
        // deleteNamespace(require('./FMMQSocket'), namespace);
    });
};

exports.socketRoomHandler = socketRoomHandler;