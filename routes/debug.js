var express = require('express');
var router = express.Router();

const {pickMusics} = require("../services/MusicService");
const {sanitizeMusicElement} = require("../services/GameService");
const {Music} = require("../models/music.model");
const {ROLE_ADMIN} = require("../constant/roles");
const {User} = require('../models/user.model');

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

router.get('/test', async function (req, res, next) {
    const musics = await pickMusics();
    const results = [];
    for(let index in musics) {
        results.push(musics[index].artist + ' - ' + musics[index].title);
    }
    res.json(results);
});



module.exports = router;
