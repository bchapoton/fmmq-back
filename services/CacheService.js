const NodeCache = require('node-cache');

const CACHE_KEY_ROOMS_IDS = 'CACHE_KEY_FMMQ_ROOM_IDS';
const CACHE_KEY_CATEGORY_MUSICS_COUNTER = 'CACHE_KEY_CATEGORY_MUSICS_COUNTER';

class CacheService {

    constructor() {
        this.cache = new NodeCache({
            stdTTL: 0, // no ttl
            useClones: false, // cache will handle game leader board, too complex for clone
        });
        this.set(CACHE_KEY_ROOMS_IDS, []);
        this.set(CACHE_KEY_CATEGORY_MUSICS_COUNTER, {});
    }

    getRoomIds() {
        return this.get(CACHE_KEY_ROOMS_IDS);
    }

    setRoom(key, value) {
        this.set(key, value);
        this.getRoomIds().push(key);
    }

    deleteRoom(key) {
        this.delete(key);
        this.getRoomIds()
            .splice(this.getRoomIds().findIndex(roomId => roomId === key), 1);
    }

    set(key, value) {
        this.cache.set(key, value);
    }

    get(key) {
        return this.cache.get(key);
    }

    findRoom(key) {
        if(key && key.startsWith('/')) {
            return this.cache.get(key.substring(1));
        }
        return this.get(key);
    }

    delete(key) {
        this.cache.del(key);
    }

    clearCategoryMusicsCount() {
        this.set(CACHE_KEY_CATEGORY_MUSICS_COUNTER, {});
    }

    getCategoryMusicsCounters() {
        return this.get(CACHE_KEY_CATEGORY_MUSICS_COUNTER);
    }

    getCategoryMusicsCount(categoryId) {
        const musicsCounter = this.get(CACHE_KEY_CATEGORY_MUSICS_COUNTER);
        if(musicsCounter[categoryId] === null || musicsCounter[categoryId] === undefined) {
            return null;
        }
        return musicsCounter[categoryId];
    }

    setCategoryMusicsCount(categoryId, count) {
        this.get(CACHE_KEY_CATEGORY_MUSICS_COUNTER)[categoryId] = count;
    }

    findChat(categoryId) {
        return this.get(categoryId + '-chat');
    }

    setChat(categoryId, chat) {
        this.set(categoryId + '-chat', chat);
    }
}

module.exports = new CacheService(); // singleton handle by Node