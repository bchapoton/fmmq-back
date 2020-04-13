const NodeCache = require('node-cache');

class CacheService {

    constructor() {
        this.cache = new NodeCache({
            stdTTL: 0, // no ttl
            useClones: false, // cache will handle game leader board, too complex for clone
        });
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
}

module.exports = new CacheService(); // singleton handle by Node