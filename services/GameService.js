const cacheService = require('./CacheService');
const {getSocket} = require("../socket/SocketHelper");
const {createSocketRoom} = require("../socket/SocketHelper");
const {Category} = require("../models/category.model");
const {pickMusics} = require("./MusicService");
const {Room} = require("./bean/Room");
const {emitOnEnter} = require("./EventEmitterService");

const getCurrentRoomPlayers = (categoryId) => {
    const game = cacheService.get(categoryId);
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
    let game = cacheService.get(categoryId);
    let playerToken;
    if (game) {
        playerToken = joinRoom(game, player);
    } else {
        game = await createRoom(categoryId);
        playerToken = joinRoom(game, player);
    }
    const category = await Category.findById(categoryId);

    // create the socket if don't exists
    createSocketRoom(getSocket(), categoryId);

    return {
        category: {
            label: category.label
        },
        playersCount: game.countPlayers(),
        currentMusicIndex: game.getCurrentMusicIndexFromZero(),
        musicsLength: game.getMusicSchemeLength(),
        leaderBoard: game.getLeaderBoard(),
        socketNamespace: categoryId,
        playerToken: playerToken
    }
};

/**
 * Create a room from category id
 *
 * @param categoryId
 * @return {Promise<Room>}
 */
async function createRoom(categoryId) {
    const musics = await pickMusics();
    const game = new Room(categoryId, musics);
    cacheService.set(categoryId, game);
    return game;
}

/**
 * Join the player to the room
 *
 * @param game current Room object
 * @param user the player
 * @return The player token
 */
function joinRoom(game, player) {
    const playerToken = game.joinRoom(player);
    emitOnEnter(game.getCategoryId(), player);
    return playerToken;
}

/**
 * Generate player bean from Auth middleware UserContext
 * @param req
 * @return {{score: number, nickname: {minlength: number, maxlength: number, unique: boolean, type: String | StringConstructor, required: boolean}, id: *}|null}
 */
const getPlayerFromUserContext = (req) => {
    if (req && req.userContext) {
        return {
            id: req.userContext._id,
            nickname: req.userContext.nickname,
            score: 0
        }
    }
    return null;
};

exports.getCurrentRoomPlayers = getCurrentRoomPlayers;
exports.enterRoom = enterRoom;
exports.getPlayerFromUserContext = getPlayerFromUserContext;