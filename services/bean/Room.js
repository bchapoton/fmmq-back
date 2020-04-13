const crypto = require('crypto');
const {generateCipherKeys} = require("../CipherUtils");

/**
 * Room handle players array, all operation on the array will be made by splice function,
 * because we use a mutable array stored in memory cache
 */
class Room {

    constructor(categoryId, musics) {
        this.categoryId = categoryId;
        this.musicScheme = musics; // all the designated music for the game, random get when creating the room
        this.currentMusicIndex = -1; // the current music id (from musicScheme array) in the game
        this.players = [];
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
     * @return string The player token
     */
    joinRoom(user) {
        const index = playerFinder(this.players, user);
        if (index === -1) {
            const playerCipher = generateCipherKeys();
            const playerToken = crypto.createHash('md5').update(playerCipher.key).digest("hex");
            this.players.push({
                id: user.id,
                playerToken: playerToken,
                playerCipher: playerCipher,
                nickname: user.nickname,
                score: 0,
                previousMusicIndexFound: -1, // the previous index found, useful to handle combo point when previous music was found
                currentMusicValues: {artist: [], title: []} // hold the splitted array of the artist and the music searched
            });
            return playerToken;
        } else {
            return this.players[index].playerToken;
        }
    }

    isPlayerAuthenticated(playerId, playerToken) {
        const index = playerFinderById(this.players, playerId);
        if(index !== -1) {
            if(this.players[index].playerToken === playerToken) {
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
            this.players[index] = this.players[index].score + point;
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
        if (str) {
            const index = playerFinder(this.players, player);
            if (index > -1) {
                if (this.players[index].currentMusicValues.artist.length > 0) {

                }
                if (this.players[index].currentMusicValues.title.length > 0) {

                }
            }
        }
    }

    endCurrentMusic() {
        if (this.currentMusicIndex < this.musicScheme.length) {
            this.currentMusicIndex = this.currentMusicIndex + 1;
            const nexMusicScheme = splitCurrentMusicScheme(this.musicScheme[this.currentMusicIndex]);
            for (let playerIndex in this.players) {
                this.players[playerIndex].currentMusicValues = playerCurrentMusicInitialState(nexMusicScheme);
            }
            return this.currentMusicIndex; // the next music will played
        }
        return -1; // the party is over
    }

    getCurrentMusicFromScheme() {
        return this.musicScheme[this.currentMusicIndex];
    }
}

const playerFinder = (array, searched) => {
    return playerFinderById(array,searched.id);
};

const playerFinderById = (array, searchedId) => {
    return array.findIndex(item => item.id === searchedId);
};

const splitCurrentMusicScheme = (currentMusicScheme) => {
    return {
        artist: currentMusicScheme.artist.split(" "),
        title: currentMusicScheme.title.split(" ")
    }
};

const playerCurrentMusicInitialState = (currentMusicScheme = null) => {
    return {
        artist: [...currentMusicScheme],
        title: [...currentMusicScheme]
    }
};

module.exports.Room = Room;