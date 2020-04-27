const express = require('express');
const {countMusicsByCategoryId} = require("../services/MusicService");
const {getCurrentRoomPlayers, enterRoom, getPlayerFromUserContext} = require("../services/GameService");
const {Category} = require("../models/category.model");
const cacheService = require('../services/CacheService');
const router = express.Router();

router.get('/categories', async (req, res, next) => {
    const categories = await Category.find().sort('order');
    const results = [];
    categories.forEach(category => {
        results.push(Object.assign(
            {},
            {
                _id: category._id,
                label: category.label,
                description: category.description
            },
            {current: getCurrentRoomPlayers(category._id.toString())}
        ));
    });
    res.json(results);
});

router.post('/:categoryId/join', async (req, res, next) => {
    const categoryId = req.params.categoryId;
    const player = getPlayerFromUserContext(req);
    const roomInfo = await enterRoom(categoryId, player);
    res.json(roomInfo);
});

router.get('/:categoryId/musics/count', (req, res, next) => {
    const categoryId = req.params.categoryId;
    const countCached = cacheService.getCategoryMusicsCount(categoryId);
    if(countCached !== null) {
        res.json({count: countCached});
    } else {
        countMusicsByCategoryId(next, categoryId, count => {
            cacheService.setCategoryMusicsCount(categoryId, count);
            res.json({count: count});
        });
    }
});

module.exports = router;