var express = require('express');
const {ServerConfig} = require("../models/serverConfig.model");
const {Game} = require("../models/game.model");
const {Music} = require("../models/music.model");
const {getPagerFromRequest} = require("../services/NetworkUtils");
const {User} = require("../models/user.model");
const {Category} = require("../models/category.model");
const serverConfig = require('../config/server');
const {isDebug} = require("../services/SystemService");
var router = express.Router();

router.get('/users', function(req, res, next) {
    adminListObjects(res, req, User, 'nickname');
});

router.get('/categories', function(req, res, next) {
    adminListObjects(res, req, Category, 'label');
});

router.get('/musics', function(req, res, next) {
    adminListObjects(res, req, Music, 'artist');
});

router.get('/games', function(req, res, next) {
    adminListObjects(res, req, Game, '-date');
});

router.get('/serverconfig', function(req, res, next) {
    const query = ServerConfig.findOne();
    query.exec((error, serverConfigEntity) => {
        if(error) {
            res.status(400).json({message: error});
        } else {
            res.json({
                codeVersion:  serverConfig.version,
                dbVersion: serverConfigEntity.version,
                creation: serverConfigEntity.creationDate,
                debug: isDebug()
            });
        }
    });
});

const adminListObjects = (res, req, model, sort) => {
    const pager = getPagerFromRequest(req);
    const query = model.find().sort(sort).skip(pager.start).limit(pager.limit);
    query.exec((error, values) => {
        if(error) {
            res.status(400).json({message: error});
        } else {
            res.json(values);
        }
    });
};

module.exports = router;
