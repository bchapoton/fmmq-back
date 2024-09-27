import {
  socketEndGameChatHandler,
  socketInGameChatHandler,
  socketRoomHandler,
} from "./SocketHandler";
import { cacheService } from "../services/CacheService";
import {
  getEndGameChatNamespace,
  getRoomChatNamespace,
} from "./NamespaceHelper";
import { Socket } from "socket.io/dist/socket";
import { DefaultEventsMap, Server } from "socket.io";

export type SocketType = Server<DefaultEventsMap, DefaultEventsMap>;

export type SocketHandlerType = (
  socket: Socket<DefaultEventsMap, DefaultEventsMap>,
  namespace: string,
) => void;

/* TODO for now we don't delete namespace, see later if it needed
export const deleteNamespace = (socket: SocketType, namespace: string) => {
  // clean cache
  let socketsCached = cacheService.get(SOCKETS_NAMESPACE_CACHE_KEY);
  if (socketsCached) {
    const socketCachedIndex = socketsCached.findIndex(
      (registeredNamespace) => registeredNamespace === namespace,
    );
    if (socketCachedIndex !== -1) {
      socketsCached.splice(socketCachedIndex, 1);
    }
  }

  // check if namespace exists
  if (Object.keys(socket.nsps).indexOf(namespace) === -1) {
    return;
  }
  // Get Namespace
  const MyNamespace = socket.of(namespace);

  // Get Object with Connected SocketIds as properties
  const connectedNameSpaceSockets = Object.keys(MyNamespace.connected);
  connectedNameSpaceSockets.forEach((socketId) => {
    MyNamespace.connected[socketId].disconnect(); // Disconnect Each socket
  });

  // Remove all Listeners for the event emitter
  MyNamespace.removeAllListeners();

  // remove the namespace
  // delete socket.nsps[namespace]; // TODO voir cette histoire de delete problème de perf
  socket.nsps = Object.keys(socket.nsps).reduce((newObject, key) => {
    if (key !== namespace) {
      newObject[key] = socket.nsps[key];
    }
    return newObject;
  }, {});
};
*/

export const createNamespace = (
  socket: SocketType,
  namespace: string,
  handler: SocketHandlerType,
) => {
  if (!cacheService.isSocketNamespaceCached(namespace)) {
    // namespace doesn't exists create and bind the events
    socket
      .of(namespace)
      .on("connection", (socket) => handler(socket, namespace));
    cacheService.addSocketNamespaceInCache(namespace);
  }
};

export const createSocketRoom = (socket: SocketType, categoryId: string) => {
  // game room socket
  createNamespace(socket, "/" + categoryId, socketRoomHandler);
  // chat room socket
  createNamespace(
    socket,
    "/" + getRoomChatNamespace(categoryId),
    socketInGameChatHandler,
  );
};

export const createSocketChatEndGame = (
  socket: SocketType,
  categoryId: string,
) => {
  createNamespace(
    socket,
    "/" + getEndGameChatNamespace(categoryId),
    socketEndGameChatHandler,
  );
};

export const getSocket = () => {
  const { socket } = require("../main");
  return socket;
};
