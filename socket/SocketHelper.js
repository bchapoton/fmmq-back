const {socketRoomHandler} = require("./SocketHandler");
const cacheService = require('../services/CacheService');
const {socketEndGameChatHandler} = require("./SocketHandler");
const {getEndGameChatNamespace} = require("./NamespaceHelper");
const {socketInGameChatHandler} = require("./SocketHandler");
const {getRoomChatNamespace} = require("./NamespaceHelper");
const SOCKETS_NAMESPACE_CACHE_KEY = 'FMMQ-sockets-namespaces';

// TODO for now we don't delete namespace, see later if it needed
const deleteNamespace = (socket, namespace) => {
    // clean cache
    let socketsCached = cacheService.get(SOCKETS_NAMESPACE_CACHE_KEY);
    if (socketsCached) {
        const socketCachedIndex = socketsCached.findIndex(registeredNamespace => registeredNamespace === namespace);
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
    connectedNameSpaceSockets.forEach(socketId => {
        MyNamespace.connected[socketId].disconnect(); // Disconnect Each socket
    });

    // Remove all Listeners for the event emitter
    MyNamespace.removeAllListeners();

    // remove the namespace
    // delete socket.nsps[namespace]; // TODO voir cette histoire de delete problème de perf
    socket.nsps = Object.keys(socket.nsps).reduce((newObject, key) => {
        if (key !== namespace) {
            newObject[key] = socket.nsps[key]
        }
        return newObject
    }, {});
};

const createNamespace = (socket, namespace, handler) => {
    let socketsCached = cacheService.get(SOCKETS_NAMESPACE_CACHE_KEY);
    if (!socketsCached || socketsCached.findIndex(registeredNamespace => registeredNamespace === namespace) === -1) {
        // namespace doesn't exists create and bind the events
        socket.of(namespace).on('connection', (socket) => handler(socket, namespace));
        if (!socketsCached) {
            socketsCached = [];
        }
        socketsCached.push(namespace);
        cacheService.set(SOCKETS_NAMESPACE_CACHE_KEY, socketsCached);
    }
};

const createSocketRoom = (socket, categoryId) => {
    // game room socket
    createNamespace(socket, '/' + categoryId, socketRoomHandler);
    // chat room socket
    createNamespace(socket, '/' + getRoomChatNamespace(categoryId), socketInGameChatHandler);
};

const createSocketChatEndGame = (socket, categoryId) => {
    createNamespace(socket, '/' + getEndGameChatNamespace(categoryId), socketEndGameChatHandler);
};

const getSocket = () => {
    return require('./FMMQSocket');
};

const getNamespacedSocket = (namespace) => {
    return getSocket().of(namespace);
};

exports.deleteNamespace = deleteNamespace;
exports.createNamespace = createNamespace;
exports.createSocketRoom = createSocketRoom;
exports.getSocket = getSocket;
exports.getNamespacedSocket = getNamespacedSocket;
exports.createSocketChatEndGame = createSocketChatEndGame;