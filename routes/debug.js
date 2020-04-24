var express = require('express');
var router = express.Router();

const gameCache = require('../services/CacheService');
const {doImport} = require("../importMusics/MusicImporterService");
const {pickMusicsDebug} = require("../services/MusicService");
const {ROLE_ADMIN} = require("../constant/roles");
const {User} = require('../models/user.model');

router.get('/game/:categoryId/delete', function (req, res, next) {
    const categoryId = req.params.categoryId;
    gameCache.delete(categoryId);
    res.send();
});

router.get('/setAdminRole', async function (req, res, next) {
    await setAdmin('vincent_8710@yahoo.com');
    await setAdmin('b.chapoton@gmail.com');
    res.send({ok: 'ok'});
});

async function setAdmin(mail) {
    await User.findOneAndUpdate(
        {email: mail},
        {role: ROLE_ADMIN});
}

router.get('/testImport', async function (req,res, next) {
    doImport();
    res.send({ok: 'ok'});
});

router.get('/testRandom', async function (req,res, next) {

    const result = await pickMusicsDebug(null, 2);
    res.send(result);
});

function getRandomIntArbitrary(min, max) {
    return parseInt(Math.random() * (max - min) + min);
}

function getRandomSortDirection() {
    return Math.random() < 0.5 ? '-' : '';
}

module.exports = router;
