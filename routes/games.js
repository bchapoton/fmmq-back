const express = require('express');
const router = express.Router();

router.get('/:category', (req, res, next) => {
    const categoryId = req.params.category;

    res.json({
        id: 1,
        started: 1585147795,
        category: {
            id: 1,
            label: 'Années 2000'
        },
        websocket: '/myWS/gameId'
    });
});

/**
 * Start a game
 */
router.post('/:category', (req, res, next) => {
    const categoryId = req.params.category;
    const payload = req.body;
    const userId = payload.id; // user id will be handled by authentication after

    res.json({
        id: 1,
        started: 1585147795,
        category: {
            id: 1,
            label: 'Années 2000'
        },
        websocket: '/myWS/gameId'
    });
});

router.get('/:category/leaderBoard', (req, res, next) => {
    const categoryId = req.params.category;

    res.json([
        {
            id: 1,
            nickname: 'user 1',
            score: 32
        },
        {
            id: 2,
            nickname: 'user 2',
            score: 23
        },
        {
            id: 3,
            nickname: 'user 3',
            score: 22
        },
        {
            id: 4,
            nickname: 'user 4',
            score: 15
        },
        {
            id: 5,
            nickname: 'user 5',
            score: 2
        }
    ]);
});

module.exports = router;