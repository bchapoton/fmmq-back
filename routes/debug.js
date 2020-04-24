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
    await doImport();
    res.send({ok: 'ok'});
});

module.exports = router;
