const gameCache = require('./CacheService');
const {Category} = require("../models/category.model");
const {pickMusics} = require("./MusicService");
const {Room} = require("./bean/Room");

const getCurrentRoomPlayers = (categoryId) => {
    const game = gameCache.get(categoryId);
    if (game) {
        return {
            playersCount: game.countPlayers(),
            currentMusicCount: game.getCurrentMusicIndexFromZero(),
            totalMusicCount: game.getMusicSchemeLength()
        };
    }
    return {playersCount: -1}; // no game start
};

const enterRoom = async (categoryId, player) => {
    let game = gameCache.get(categoryId);
    if (game) {
        joinRoom(game, player);
    } else {
        game = await createRoom(categoryId, player);
    }
    const category = await Category.findById(categoryId);

    return {
        category: {
            label: category.label
        },
        playersCount: game.countPlayers(),
        currentMusicIndex: game.getCurrentMusicIndexFromZero(),
        musicsLength: game.getMusicSchemeLength(),
        leaderBoard: game.getLeaderBoard()
    }
};

async function createRoom(categoryId, player) {
    const musics = await pickMusics();
    const game = new Room(categoryId, musics);
    gameCache.set(categoryId, game);
    joinRoom(game, player);
    return game;
}

function joinRoom(game, player) {
    game.joinRoom(player);
}

const getPlayerFromUserContext = (req) => {
    if (req && req.userContext) {
        return {
            id: req.userContext._id,
            nickname: req.userContext.nickname
        }
    }
    return null;
};

exports.getCurrentRoomPlayers = getCurrentRoomPlayers;
exports.enterRoom = enterRoom;
exports.getPlayerFromUserContext = getPlayerFromUserContext;