const express = require('express');
const {getPagerFromRequest} = require("../services/NetworkUtils");
const {Game} = require("../models/game.model");
const {getCurrentRoomPlayers, enterRoom, getPlayerFromUserContext} = require("../services/GameService");
const {Category} = require("../models/category.model");
const router = express.Router();

router.get('/over/:gameId', (req, res, next) => {
    const gameId = req.params.gameId;
    Game.findById(gameId).then(gameObject => {
        if (gameObject) {
            const gameDTO = {};
            gameDTO.categoryId = gameObject.categoryId;
            gameDTO.categoryLabel = gameObject.categoryLabel;
            gameDTO.musicScheme = JSON.parse(gameObject.musicScheme);
            gameDTO.leaderBoard = JSON.parse(gameObject.leaderBoard);
            gameDTO.podium = JSON.parse(gameObject.podium);
            gameDTO.date = gameObject.date.getTime();
            res.send(gameDTO);
        } else {
            res.status(404).send();
        }
    });
});

router.get('/podiums', (req, res, next) => {
    const pager = getPagerFromRequest(req);
    Game.find()
        .limit(pager.limit)
        .sort('-date')
        .then( games => {
            const result = [];
            games.forEach(game => {
                result.push({
                    id: game._id,
                    category: game.categoryLabel,
                    date: game.date.getTime(),
                    podium: JSON.parse(game.podium)
                })
            });
            res.json(result);
        });
});

module.exports = router;