const cacheService = require('./CacheService');
const {getSocket} = require("../socket/SocketHelper");
const {createSocketRoom} = require("../socket/SocketHelper");
const {Category} = require("../models/category.model");
const {pickMusics} = require("./MusicService");
const {emitOnEnter} = require("./EventEmitterService");
const accents = require('remove-accents');
const compareAlgo = require("damerau-levenshtein-js");

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
    const category = await Category.findById(categoryId);
    let game = cacheService.get(categoryId);
    let playerObject;
    if (game) {
        playerObject = joinRoom(game, player);
    } else {
        game = await createRoom(categoryId, category.label);
        playerObject = joinRoom(game, player);
        game.start(player.nickname);
    }

    // create the socket if don't exists
    createSocketRoom(getSocket(), categoryId);

    let currentMusicInProgress = null;
    if(game.currentMusicStartTimestamp !== null) {
        // if this is set a music is in progress send the data for start playing the music in the middle of it
        const currentMusicPosition = Math.round(new Date().getTime() - game.currentMusicStartTimestamp);
        currentMusicInProgress = {
            positionMilliseconds: currentMusicPosition,
            musicInfo: game.buildMusicObjectForClientPlayer()
        };
    }

    return {
        category: {
            label: category.label
        },
        playersCount: game.countPlayers(),
        currentMusicIndex: game.getCurrentMusicIndexFromZero(),
        musicsLength: game.getMusicSchemeLength(),
        leaderBoard: game.getLeaderBoard(),
        socketNamespace: categoryId,
        playerToken: playerObject.playerToken,
        playerId: player.id,
        currentMusicInProgress: currentMusicInProgress
    }
};

/**
 * Create a room from category id
 *
 * @param categoryId
 * @return {Promise<Room>}
 */
async function createRoom(categoryId, categoryLabel) {
    const {Room} = require("./bean/Room"); // avoid cyclic dependencies between Room and GameService leading to undefined required functions
    const musics = await pickMusics();
    const game = new Room(categoryId, categoryLabel, musics);
    cacheService.setRoom(categoryId, game);
    return game;
}

/**
 * Join the player to the room
 *
 * @param game current Room object
 * @param user the player
 * @return Object The player object
 */
function joinRoom(game, player) {
    const playerObject = game.joinRoom(player);
    emitOnEnter(game.getCategoryId(), player);
    return playerObject;
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

/**
 * Remove accents and set to lower case
 *
 * @param string element the title or artist
 * @return string the accents free and lower case string
 */
const sanitizeMusicElement = (element) => {
    const elementLowerWithoutAccent = removeAccentToLowerCase(element);
    return clean(elementLowerWithoutAccent);
};

const sanitizeGuess = (element) => {
    return removeAccentToLowerCase(element);
};

function removeAccentToLowerCase(element) {
    return accents.remove(element.trim()).toLowerCase();
}

function clean(str) {
    return cleanForbiddenWords(str, ['feat.', '...']);
}

function cleanForbiddenWords(str, words) {
    const strArr = str.split(' ');
    const result = [];
    for (let index in strArr) {
        const strItem = strArr[index];
        if (strItem.length > 1 && !words.includes(strItem)) {
            result.push(strItem);
        }
    }
    let cleaned = result.join(' ');
    if(cleaned.indexOf('(') && cleaned.indexOf(')')) {
        cleaned = cleaned.substring(0, cleaned.indexOf('(')) + cleaned.substring(cleaned.indexOf(')') + 1);
    }
    if(cleaned.indexOf('[') && cleaned.indexOf(']')) {
        cleaned = cleaned.substring(0, cleaned.indexOf('[')) + cleaned.substring(cleaned.indexOf(']') + 1);
    }
    return cleaned.trim();
}

const splitMusicElement = (element) => {
    return element.split(' ');
};

/**
 * Compare sanitizedGuessTry
 *
 * @param sanitizedOriginalStr the original split string array without accents and uppercase
 * @param sanitizedGuessTry the guess try array without accents and uppercase already split by the function splitMusicElement
 * @return {{originalWordFound: [], guessWordFound: []}} original words found in this round and the guess try found in this round
 */
const compareGuessTry = (sanitizedOriginalSplit, sanitizedGuessTrySplit) => {
    // allow more error in long word
    const smallWordAllowedDistance = [0, 1];
    const longWordAllowedDistance = [0, 1, 2];

    let originalWordFound = [];
    let guessWordFound = [];
    // copy original array, we will remove on each searched all found elements
    let internalGuessTrySplit = [...sanitizedGuessTrySplit];

    for (let i in sanitizedOriginalSplit) {
        let originalWord = sanitizedOriginalSplit[i];
        const internalOriginalFound = [];
        const internalGuessFound = [];

        for (let j in internalGuessTrySplit) {
            let guessWord = internalGuessTrySplit[j];
            const distance = compareAlgo.distance(originalWord, guessWord);
            let isFound;
            if (originalWord.length < 5) {
                isFound = smallWordAllowedDistance.includes(distance);
            } else {
                isFound = longWordAllowedDistance.includes(distance);
            }
            if (isFound) {
                internalOriginalFound.push(originalWord);
                internalGuessFound.push(guessWord);
                break;
            }
        }
        originalWordFound = originalWordFound.concat(internalOriginalFound);
        guessWordFound = guessWordFound.concat(internalGuessFound);
        // remove all the found words in this iteration
        internalGuessTrySplit = internalGuessTrySplit.filter(item => !internalGuessFound.includes(item));
        if (internalGuessTrySplit.length === 0) {
            // no more word to search stop here
            break;
        }
    }

    return {originalWordFound: originalWordFound, guessWordFound: guessWordFound};
};

exports.getCurrentRoomPlayers = getCurrentRoomPlayers;
exports.enterRoom = enterRoom;
exports.getPlayerFromUserContext = getPlayerFromUserContext;
exports.sanitizeMusicElement = sanitizeMusicElement;
exports.sanitizeGuess = sanitizeGuess;
exports.splitMusicElement = splitMusicElement;
exports.compareGuessTry = compareGuessTry;