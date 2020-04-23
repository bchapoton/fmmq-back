const crypto = require('crypto');
const cacheService = require('../CacheService');
const {logDebug} = require("../../logger/Logger");
const {Game} = require("../../models/game.model");
const {emitGameEnds} = require("../EventEmitterService");
const {emitAlreadyFoundEverything} = require("../EventEmitterService");
const {emitRoundEnds} = require("../EventEmitterService");
const {emitRoundStarts} = require("../EventEmitterService");
const {emitOnGuessed} = require("../EventEmitterService");
const {emitOnFailed} = require("../EventEmitterService");
const {compareGuessTry} = require("../GameService");
const {sanitizeMusicElement} = require("../GameService");
const {splitMusicElement} = require("../GameService");
const {generateCipherKeys} = require("../CipherUtils");

/**
 * Room handle players array, all operation on the array will be made by splice function,
 * because we use a mutable array stored in memory cache
 */
class Room {

    constructor(categoryId, categoryLabel, musics) {
        this.categoryId = categoryId;
        this.categoryLabel = categoryLabel;
        this.musicScheme = musics; // all the designated music for the game, random get when creating the room
        this.currentMusicIndex = -1; // the current music id (from musicScheme array) in the game
        this.players = [];
        this.currentMusicTrophy = [];
        this.onAir = false; // if true a music to guess is in progress
        this.timeoutRef = null;
    }

    getCategoryId() {
        return this.categoryId;
    }

    countPlayers() {
        return this.players.length;
    }

    getCurrentMusicIndexFromZero() {
        return this.currentMusicIndex + 1;
    }

    getMusicSchemeLength() {
        return this.musicScheme.length;
    }

    getLeaderBoard() {
        const leaderBoard = [];
        this.players.forEach(player => {
            leaderBoard.push({
                id: player.id,
                nickname: player.nickname,
                score: player.score
            });
        });
        return leaderBoard;
    }

    /**
     * Join the player to the room
     *
     * @param object user the player
     * @return Object the player object
     */
    joinRoom(user) {
        const index = playerFinder(this.players, user);
        if (index === -1) {
            const playerCipher = generateCipherKeys();
            const playerToken = crypto.createHash('md5').update(playerCipher.key).digest("hex");
            const playerObject = {
                id: user.id,
                playerToken: playerToken,
                nickname: user.nickname,
                score: 0,
                previousMusicIndexFound: -1, // the previous index found, useful to handle combo point when previous music was found
                currentMusicValues: {artist: [], title: []} // hold the splitted array of the artist and the music searched
            };
            this.players.push(playerObject);
            return playerObject;
        } else {
            return this.players[index];
        }
    }

    isPlayerAuthenticated(playerId, playerToken) {
        const index = playerFinderById(this.players, playerId);
        if (index !== -1) {
            if (this.players[index].playerToken === playerToken) {
                return this.players[index];
            }
        }
        return null;
    }

    quit(player) {
        const index = playerFinder(this.players, player);
        if (index > -1) {
            this.players.splice(index, 1);
        }
    }

    addPoint(player, point) {
        const index = playerFinder(this.players, player);
        if (index > -1) {
            this.players[index].score = this.players[index].score + point;
        }
    }

    findBoth(player) {
        const index = playerFinder(this.players, player);
        if (index > -1) {
            this.players[index].previousMusicIndexFound = this.currentMusicIndex;
        }
    }

    hasFoundPreviousMusic(player) {
        const index = playerFinder(this.players, player);
        if (index > -1) {
            return this.players[index].previousMusicIndexFound === (this.currentMusicIndex - 1);
        }
        return false;
    }

    guess(player, str) {
        if (!this.onAir) {
            return; // no music to find yet
        }

        if (str) {
            const index = playerFinder(this.players, player);
            if (index > -1) {
                if (this.players[index].currentMusicValues.artist.length === 0
                    && this.players[index].currentMusicValues.title.length === 0) {
                    // already found everything
                    emitAlreadyFoundEverything(this.getCategoryId(), player);
                    return;
                }

                let guessTryArray = splitMusicElement(sanitizeMusicElement(str));
                logDebug('-----TRY');
                logDebug(guessTryArray);
                logDebug('current player artist : ' + this.players[index].currentMusicValues.artist);
                logDebug('current player title : ' + this.players[index].currentMusicValues.title);

                const stillToFindInArtistLength = this.players[index].currentMusicValues.artist.length;
                const stillToFindInTitleLength = this.players[index].currentMusicValues.title.length;

                let alreadyFound = 'NONE';
                let foundThisRound = null;
                let foundArtist = null;
                let foundTitle = null;
                let currentArtistValues = this.players[index].currentMusicValues.artist;
                if (currentArtistValues.length > 0) {
                    const {originalWordFound, guessWordFound} = compareGuessTry(currentArtistValues, guessTryArray);
                    logDebug('after artist original found : ' + originalWordFound);
                    logDebug('after artist try found : ' + guessWordFound);
                    // remove found words for the title try
                    if (guessWordFound.length > 0) {
                        guessTryArray = guessTryArray.filter(item => !guessWordFound.includes(item));
                    }
                    this.players[index].currentMusicValues.artist = currentArtistValues.filter(item => !originalWordFound.includes(item));
                    foundArtist = this.players[index].currentMusicValues.artist.length === 0;
                    foundThisRound = foundArtist ? 'ARTIST' : null;
                } else {
                    alreadyFound = 'ARTIST';
                }
                logDebug('foundThisRound : ' + foundThisRound)

                let currentTitleValues = this.players[index].currentMusicValues.title;
                if (currentTitleValues.length > 0) {
                    const {originalWordFound, guessWordFound} = compareGuessTry(currentTitleValues, guessTryArray);
                    this.players[index].currentMusicValues.title = currentTitleValues.filter(item => !originalWordFound.includes(item));
                    foundTitle = this.players[index].currentMusicValues.title.length === 0;
                    foundThisRound = foundTitle ? (foundThisRound === 'ARTIST' ? 'BOTH' : 'TITLE') : foundThisRound;
                    logDebug('after artist original found : ' + originalWordFound);
                    logDebug('after artist try found' + guessWordFound);
                } else {
                    alreadyFound = 'TITLE';
                }
                logDebug('foundThisRound : ' + foundThisRound);
                logDebug('alreadyFound : ' + alreadyFound);

                if (foundThisRound === null) {
                    const stillToFindInArtistAfterGuessLength = this.players[index].currentMusicValues.artist.length;
                    const stillToFindInTitleAfterGuessLength = this.players[index].currentMusicValues.title.length;

                    let artistAccuracy = 0;
                    if (stillToFindInArtistLength !== 0)
                        artistAccuracy = (stillToFindInArtistLength - stillToFindInArtistAfterGuessLength) / stillToFindInArtistLength;
                    let titleAccuracy = 0;
                    if (stillToFindInTitleLength !== 0)
                        titleAccuracy = (stillToFindInTitleLength - stillToFindInTitleAfterGuessLength) / stillToFindInTitleLength;
                    logDebug(Math.max(artistAccuracy, titleAccuracy));
                    emitOnFailed(this.getCategoryId(), player, Math.max(artistAccuracy, titleAccuracy));
                } else {
                    const currentMusicScheme = this.getCurrentMusicFromScheme();
                    let musicObjectFound = null;
                    let points = 0;
                    if (foundThisRound === 'BOTH') {
                        points = 2;
                        musicObjectFound = {
                            title: currentMusicScheme.title,
                            artist: currentMusicScheme.artist
                        }
                    } else if (foundThisRound === 'ARTIST') {
                        points = 1;
                        musicObjectFound = {
                            artist: currentMusicScheme.artist
                        }
                    } else if (foundThisRound === 'TITLE') {
                        points = 1;
                        musicObjectFound = {
                            title: currentMusicScheme.title
                        }
                    }

                    let foundEveryThing = false;
                    let trophy = 0;
                    if (this.players[index].currentMusicValues.artist.length === 0
                        && this.players[index].currentMusicValues.title.length === 0) {
                        foundEveryThing = true;
                        // user found everything handle trophy and previous music index
                        if (this.hasFoundPreviousMusic(player)) {
                            points += 1; // combo found the previous music
                        }
                        this.findBoth(player);

                        if (this.currentMusicTrophy.length <= 3) {
                            this.currentMusicTrophy.push(player.id);
                            trophy = this.currentMusicTrophy.length;
                            if (trophy === 1) {
                                points += 3;
                            } else if (trophy === 2) {
                                points += 2;
                            } else if (trophy === 3) {
                                points += 1;
                            }
                        }
                    }
                    logDebug({
                        points,
                        foundThisRound,
                        alreadyFound,
                        trophy,
                        musicObjectFound
                    });
                    if (points > 0) {
                        this.addPoint(player, points);
                        emitOnGuessed(
                            this.getCategoryId(),
                            player,
                            points,
                            foundThisRound,
                            alreadyFound,
                            trophy,
                            musicObjectFound,
                            foundEveryThing
                        );
                    }
                }
            }
        }
    }

    start() {
        this.endCurrentMusic(10000);
    }

    startCurrentMusic() {
        this.onAir = true;
        if (this.timeoutRef) {
            clearTimeout(this.timeoutRef);
        }

        // clean players music scheme to find
        const nexMusicScheme = splitCurrentMusicScheme(this.musicScheme[this.currentMusicIndex]);
        for (let playerIndex in this.players) {
            this.players[playerIndex].currentMusicValues = playerCurrentMusicInitialState(nexMusicScheme);
        }

        emitRoundStarts(this.getCategoryId(), this.getCurrentMusicFromScheme(), this.getCurrentMusicIndexFromZero());
        const _self = this;
        this.timeoutRef = setTimeout(() => {
            _self.endCurrentMusic();
        }, 30000);
    }

    async endCurrentMusic(pauseTimerMilliseconds = 5000) {
        this.onAir = false;
        this.currentMusicTrophy = [];
        let previousMusicScheme;
        if (this.currentMusicIndex > -1) {
            previousMusicScheme = this.musicScheme[this.currentMusicIndex];
        }
        this.currentMusicIndex = this.currentMusicIndex + 1;

        if (this.timeoutRef) {
            clearTimeout(this.timeoutRef);
        }

        if (this.currentMusicIndex >= this.musicScheme.length) {
            // game is over
            logDebug(this.categoryId);
            logDebug(this.musicScheme);
            logDebug(this.players);

            const gameMusicScheme = [];
            this.musicScheme.forEach(music => {
                gameMusicScheme.push({
                   id: music.id,
                    artist: music.artist,
                    title: music.title
                });
            });

            const sortedPlayers = playersSorter(this.players);
            const podium = [];
            const leaderBoard = [];
            sortedPlayers.forEach(player => {
                const playerToStore = {
                    id: player.id,
                    nickname: player.nickname,
                    score: player.score
                };

                if(podium.length <= 3) {
                    podium.push(playerToStore);
                }
                leaderBoard.push(playerToStore);
            });

            // clean the game in cache
            cacheService.delete(this.getCategoryId());

            const game = new Game({
                categoryId: this.getCategoryId(),
                categoryLabel: this.categoryLabel,
                musicScheme: JSON.stringify(gameMusicScheme),
                leaderBoard: JSON.stringify(leaderBoard),
                podium: JSON.stringify(podium),
                date: new Date()
            });
            await game.save();

            emitGameEnds(this.getCategoryId(), game._id);
        } else {
            const nexMusicScheme = this.musicScheme[this.currentMusicIndex];
            if (previousMusicScheme) {
                // emit only if there was a music before, otherwise it's a game start !
                emitRoundEnds(this.getCategoryId(), previousMusicScheme, nexMusicScheme);
            }
            const _self = this;
            this.timeoutRef = setTimeout(() => {
                _self.startCurrentMusic();
            }, pauseTimerMilliseconds);
        }

    }

    getCurrentMusicFromScheme() {
        return this.musicScheme[this.currentMusicIndex];
    }
}

const playerFinder = (array, searched) => {
    return playerFinderById(array, searched.id);
};

const playerFinderById = (array, searchedId) => {
    return array.findIndex(item => item.id === searchedId);
};

const splitCurrentMusicScheme = (currentMusicScheme) => {
    return {
        artist: currentMusicScheme.artistSanitized.split(" "),
        title: currentMusicScheme.titleSanitized.split(" ")
    }
};

const playerCurrentMusicInitialState = (currentMusicScheme) => {
    return {
        artist: [...currentMusicScheme.artist],
        title: [...currentMusicScheme.title]
    }
};

const playersSorter = (players) => {
    if (!players || players.length === 0) {
        return [];
    }

    return players.slice().sort((item1, item2) => {
        const score1 = item1.score ? item1.score : 0;
        const score2 = item2.score ? item2.score : 0;
        return (score1 - score2) * -1; // desc sorting
    });
};

module.exports.Room = Room;