var express = require('express');
const {ServerConfig} = require("../models/serverConfig.model");
const {Game} = require("../models/game.model");
const {Music} = require("../models/music.model");
const {getPagerFromRequest} = require("../services/NetworkUtils");
const {User} = require("../models/user.model");
const {Category} = require("../models/category.model");
const serverConfig = require('../config/server');
const {putUserRole} = require("../services/UserService");
const {findUserById} = require("../services/UserService");
const {createImport} = require("../services/ImportService");
const {createCategory} = require("../services/CategoryService");
const {updateCategory} = require("../services/CategoryService");
const {findCategoryById} = require("../services/CategoryService");
const {deleteImport} = require("../services/ImportService");
const {findImportById} = require("../services/ImportService");
const {doImport} = require("../services/ImportService");
const {Import} = require("../models/import.model");
const {delMusicDuplicates} = require("../services/AdministrationService");
const {getMusicDuplicates} = require("../services/AdministrationService");
const {reSanitizeDB} = require("../services/AdministrationService");
const {isDebug} = require("../services/SystemService");
const cacheService = require('../services/CacheService');
const {ObjectNotFoundException} = require("../exceptions/ObjectNotFoundException");
const router = express.Router();

router.get('/count/:type', function (req, res, next) {
    const type = req.params.type;
    let model;
    if (type === 'users') {
        model = User;
    } else if (type === 'categories') {
        model = Category;
    } else if (type === 'musics') {
        model = Music;
    } else if (type === 'games') {
        model = Game;
    } else if (type === 'imports') {
        model = Import;
    } else {
        res.status(404).json({message: "can't count type : " + type});
        return;
    }
    adminCountObjects(res, model);
});

router.get('/users', function (req, res, next) {
    adminListObjects(res, req, User, 'nickname');
});

router.get('/users/:id', function (req, res, next) {
    const id = req.params.id;
    findUserById(next, id, user => {
        res.json(user);
    });
});

router.put('/users/:id', async function (req, res, next) {
    const id = req.params.id;
    const payload = req.body;
    await putUserRole(next, id, payload);
    res.send();
});

router.get('/categories', function (req, res, next) {
    adminListObjects(res, req, Category, 'label');
});

router.get('/categories/:id', async function (req, res, next) {
    const id = req.params.id;
    findCategoryById(next, id, (category) => {
        res.json(category);
    });
});

router.put('/categories/:id', async function (req, res, next) {
    const id = req.params.id;
    const payload = req.body;
    updateCategory(next, id, payload)
        .then(() => res.json());
});

router.post('/categories', async function (req, res, next) {
    const payload = req.body;
    await createCategory(next, payload);
    res.json();
});

router.delete('/categories/:id', async function (req, res, next) {
    const id = req.params.id;
    const category = await Category.findById(id);
    if (category) {
        category.delete(error => {
            if (error) {
                res.status(400).send();
            } else {
                res.send();
            }
        });
    } else {
        res.status(404).send();
    }
});

router.get('/musics', function (req, res, next) {
    adminListObjects(res, req, Music, 'artist');
});

router.post('/musics/reSanitizeDB', async function (req, res, next) {
    const start = new Date().getTime();
    let result = await reSanitizeDB();
    const duration = new Date().getTime() - start;
    res.json(
        Object.assign(result, {duration: duration})
    );
});

router.get('/musics/duplicates', async function (req, res, next) {
    const start = new Date().getTime();
    let result = await getMusicDuplicates();
    const duration = new Date().getTime() - start;
    res.json(
        Object.assign(result, {duration: duration})
    );
});

router.delete('/musics/duplicates', async function (req, res, next) {
    const start = new Date().getTime();
    let result = await delMusicDuplicates();
    const duration = new Date().getTime() - start;
    res.json(
        Object.assign(result, {duration: duration})
    );
});

router.delete('/musics/all', async function (req, res, next) {
    const start = new Date().getTime();
    await Music.db.dropCollection('musics');
    const duration = new Date().getTime() - start;
    res.json(
        Object.assign({message: 'All musics dropped'}, {duration: duration})
    );
});

router.get('/games', function (req, res, next) {
    adminListObjects(res, req, Game, '-date');
});

router.get('/imports', function (req, res, next) {
    adminListObjects(res, req, Import, '-creationDate');
});

router.get('/imports/:id', async function (req, res, next) {
    const id = req.params.id;
    findImportById(next, id, (importEntity) => {
        res.json(importEntity);
    });
});

router.delete('/imports/:id', async function (req, res, next) {
    const id = req.params.id;
    await deleteImport(next, id);
    res.send();
});

router.post('/imports/:id', async function (req, res, next) {
    const id = req.params.id;
    const user = req.userContext;
    const report = await doImport(next, user, id);
    res.json(report);
});

router.post('/imports', async function (req, res, next) {
    const payload = req.body;
    const user = req.userContext;
    await createImport(next, user, payload);
    res.send();
});

router.get('/serverconfig', function (req, res, next) {
    const query = ServerConfig.findOne();
    query.exec((error, serverConfigEntity) => {
        if (error) {
            res.status(400).json({message: error});
        } else {
            res.json({
                codeVersion: serverConfig.version,
                dbVersion: serverConfigEntity.version,
                creation: serverConfigEntity.creationDate,
                debug: isDebug()
            });
        }
    });
});

router.get('/cache/objects', function (req, res, next) {
    const roomIds = cacheService.getRoomIds();
    const rooms = [];
    for(let index in roomIds) {
        const roomId = roomIds[index];
        const room = cacheService.findRoom(roomId);
        rooms.push({
            categoryId: room.getCategoryId(),
            categoryLabel: room.categoryLabel,
            players: room.countPlayers(),
            currentMusicIndex: room.getCurrentMusicIndexFromZero(),
            musicSchemeLength: room.getMusicSchemeLength(),
        })
    }

    res.json({
        rooms,
        categoryMusicsCounters: cacheService.getCategoryMusicsCounters()
    })
});


router.get('/cache/objects/:roomId', function (req, res, next) {
    const roomId = req.params.roomId;
    const room = cacheService.findRoom(roomId);
    if(room) {
        res.json(room.toJSON());
    } else {
        next(new ObjectNotFoundException("Can't find the room"));
    }
});

const adminListObjects = (res, req, model, sort) => {
    const pager = getPagerFromRequest(req);
    const query = model.find().sort(sort).skip(pager.start).limit(pager.limit);
    query.exec((error, values) => {
        if (error) {
            res.status(400).json({message: error});
        } else {
            res.json(values);
        }
    });
};

const adminCountObjects = (res, model) => {
    model.countDocuments({}, (error, count) => {
        if (error) {
            res.status(400).json({message: error});
        } else {
            res.json({count: count});
        }
    });
};

module.exports = router;
