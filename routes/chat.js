const express = require('express');
const cacheService = require('../services/CacheService');
const {getSocket} = require("../socket/SocketHelper");
const {createSocketChatEndGame} = require("../socket/SocketHelper");
const {EndGameChat} = require("../services/bean/EndGameChat");
const router = express.Router();

router.post('/:categoryId/join', async (req, res, next) => {
    const categoryId = req.params.categoryId;
    const user = req.userContext;
    let chat = cacheService.findChat(categoryId);
    let player;
    if(chat) {
        player = chat.join(user);
    } else {
        const chat = new EndGameChat(categoryId);
        cacheService.setChat(categoryId, chat);
        createSocketChatEndGame(getSocket(), categoryId);
        player = chat.join(user);
    }
    res.json(player);
});

module.exports = router;