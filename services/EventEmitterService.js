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
 * @param music object the found values (artist, title or both)
 */
const emitOnGuessed = (categoryId, player, points, found, alreadyFound, trophy, music, foundEveryThing) => {
    const payload = {
        playerId: player.id,
        points: points,
        found: found,
        alreadyFound: alreadyFound,
        foundEveryThing: foundEveryThing
    };

    if (trophy && (trophy === 1 || trophy === 2 || trophy === 3)) {
        payload.trophy = trophy;
    }

    if (music) {
        payload.music = music;
    }

    socket.of(categoryId).emit('GUESSED', payload);
};

const emitRoundStarts = (categoryId, currentMusicScheme, currentMusicIndexFromZero) => {
    socket.of(categoryId).emit('ROUND_STARTS', {
        fileUrl: currentMusicScheme.file,
        currentMusicIndexDisplayed: currentMusicIndexFromZero
    });
};

const emitRoundEnds = (categoryId, currentMusicScheme, nextMusicScheme) => {
    const payload = {
        nextFile: nextMusicScheme.file
    };

    if (currentMusicScheme) {
        payload.music = {
            artist: currentMusicScheme.artist,
            title: currentMusicScheme.title
        };
    }

    socket.of(categoryId).emit('ROUND_ENDS', payload);
};

const emitAlreadyFoundEverything = (categoryId, player) => {
    socket.of(categoryId).emit('ALREADY_FOUND_EVERYTHING', {playerId: player.id});
};

exports.emitOnEnter = emitOnEnter;
exports.emitOnFailed = emitOnFailed;
exports.emitOnGuessed = emitOnGuessed;
exports.emitRoundStarts = emitRoundStarts;
exports.emitRoundEnds = emitRoundEnds;
exports.emitAlreadyFoundEverything = emitAlreadyFoundEverything;