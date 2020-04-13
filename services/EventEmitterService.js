const socket = require('../socket/FMMQSocket');

const emitOnEnter = (categoryId, player) => {
    socket.of(categoryId).emit('ENTER', player);
};

const emitOnFailed = (categoryId, player, accuracy) => {
    socket.of(categoryId).emit('FAILED', {
        playerId: player.id,
        accuracy: accuracy
    });
};

/**
 *
 * @param categoryId string
 * @param player object
 * @param points int
 * @param found string
 * @param alreadyFound string
 * @param trophy int
 */
const emitOnGuessed = (categoryId, player, points, found, alreadyFound, trophy) => {
    const payload = {
        playerId: player.id,
        points: points,
        found: found,
        alreadyFound: alreadyFound,
        trophy: trophy
    };

    if (trophy && (trophy === 1 || trophy === 2 || trophy === 3)) {
        payload.trophy = trophy;
    }

    socket.of(categoryId).emit('GUESSED', payload);
};

exports.emitOnEnter = emitOnEnter;
exports.emitOnFailed = emitOnFailed;
exports.emitOnGuessed = emitOnGuessed;