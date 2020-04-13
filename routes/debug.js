var express = require('express');
var router = express.Router();

const socket = require('../socket/FMMQSocket');
const {createSocketRoom} = require("../socket/SocketHelper");
const gameCache = require('../services/CacheService');

router.get('/test', function(req, res, next) {
  socket.emit('try', 'from endpoint');
  socket.of('currentroom').emit('try', 'current room event');
  socket.of('room1').emit('try', 'room1 event');
  socket.of('room2').emit('try', 'room2 event');
  res.send();
});

router.get('/game/:categoryId/delete', function(req, res, next) {
  const categoryId = req.params.categoryId;
  gameCache.delete(categoryId);
  res.send();
});

router.get('/init2', function(req, res, next) {
  createSocketRoom(socket, 'room2');
  res.send();
});

module.exports = router;
