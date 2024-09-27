import NodeCache from "node-cache";
import { Room } from "./bean/Room";
import { EndGameChat } from "./bean/EndGameChat";

const CACHE_KEY_ROOMS_IDS = "CACHE_KEY_FMMQ_ROOM_IDS";
const CACHE_KEY_CATEGORY_MUSICS_COUNTER = "CACHE_KEY_CATEGORY_MUSICS_COUNTER";
const SOCKETS_NAMESPACE_CACHE_KEY = "FMMQ-sockets-namespaces";

class CacheService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: 0, // no ttl
      useClones: false, // cache will handle game leader board, too complex for clone
    });
    this.set(CACHE_KEY_ROOMS_IDS, []);
    this.set(CACHE_KEY_CATEGORY_MUSICS_COUNTER, {});
  }

  getRoomIds(): Array<string> {
    return this.get(CACHE_KEY_ROOMS_IDS) as Array<string>;
  }

  setRoom(key: string, value: Room) {
    this.set(key, value);
    this.getRoomIds().push(key);
  }

  deleteRoom(key: string) {
    this.delete(key);
    this.getRoomIds().splice(
      this.getRoomIds().findIndex((roomId) => roomId === key),
      1,
    );
  }

  set(key: string, value: any) {
    this.cache.set(key, value);
  }

  get(key: string): any {
    return this.cache.get(key);
  }

  findRoom(key: string): Room | undefined {
    if (key && key.startsWith("/")) {
      return this.cache.get(key.substring(1)) as Room | undefined;
    }
    return this.get(key) as Room | undefined;
  }

  delete(key: string) {
    this.cache.del(key);
  }

  clearCategoryMusicsCount() {
    this.set(CACHE_KEY_CATEGORY_MUSICS_COUNTER, {});
  }

  getCategoryMusicsCounters() {
    return this.get(CACHE_KEY_CATEGORY_MUSICS_COUNTER);
  }

  getCategoryMusicsCount(categoryId: string) {
    const musicsCounter = this.get(CACHE_KEY_CATEGORY_MUSICS_COUNTER);
    if (
      musicsCounter[categoryId] === null ||
      musicsCounter[categoryId] === undefined
    ) {
      return null;
    }
    return musicsCounter[categoryId];
  }

  setCategoryMusicsCount(categoryId: string, count: number) {
    this.get(CACHE_KEY_CATEGORY_MUSICS_COUNTER)[categoryId] = count;
  }

  findChat(categoryId: string): EndGameChat | undefined {
    return this.get(categoryId + "-chat");
  }

  setChat(categoryId: string, chat: EndGameChat) {
    this.set(categoryId + "-chat", chat);
  }

  isSocketNamespaceCached(namespace: string) {
    const socketsCached = this.cache.get(SOCKETS_NAMESPACE_CACHE_KEY);
    if (Array.isArray(socketsCached)) {
      const socketNamespaceCacheIndex = socketsCached.findIndex(
        (registeredNamespace) => registeredNamespace === namespace,
      );
      return socketNamespaceCacheIndex >= 0;
    }

    return false;
  }

  addSocketNamespaceInCache(namespace: string) {
    const cachedSockets: Array<string> = Array.isArray(
      this.cache.get(SOCKETS_NAMESPACE_CACHE_KEY),
    )
      ? (this.cache.get(SOCKETS_NAMESPACE_CACHE_KEY) as Array<string>)
      : [];
    cachedSockets.push(namespace);
    this.cache.set(SOCKETS_NAMESPACE_CACHE_KEY, cachedSockets);
  }
}

export const cacheService = new CacheService();
