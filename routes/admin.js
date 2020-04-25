var express = require('express');
const {ServerConfig} = require("../models/serverConfig.model");
const {Game} = require("../models/game.model");
const {Music} = require("../models/music.model");
const {getPagerFromRequest} = require("../services/NetworkUtils");
const {User} = require("../models/user.model");
const {Category} = require("../models/category.model");
const serverConfig = require('../config/server');
const {deleteMusicByImportId} = require("../services/MusicService");
const {getMusicRandomInt} = require("../services/MusicService");
const {sanitizeMusicElement} = require("../services/GameService");
const {validateImportMetadataFormat} = require("../services/ValidationService");
const {Import} = require("../models/import.model");
const {delMusicDuplicates} = require("../services/AdministrationService");
const {getMusicDuplicates} = require("../services/AdministrationService");
const {reSanitizeDB} = require("../services/AdministrationService");
const {isDebug} = require("../services/SystemService");
var router = express.Router();

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

router.get('/categories', function (req, res, next) {
    adminListObjects(res, req, Category, 'label');
});

router.get('/categories/:id', async function (req, res, next) {
    const id = req.params.id;
    const category = await Category.findById(id);
    if (category) {
        res.send(category);
    } else {
        res.status(404).send();
    }
});

router.put('/categories/:id', async function (req, res, next) {
    const id = req.params.id;
    const payload = req.body;
    const category = await Category.findById(id);
    if (category) {
        if (payload.label && payload.description && payload.order) {
            category.label = payload.label;
            category.description = payload.description;
            category.order = payload.order;
            await category.save();
            res.send();
        } else {
            res.status(400).send();
        }
    } else {
        res.status(404).send();
    }
});

router.post('/categories', async function (req, res, next) {
    const payload = req.body;
    if (payload && payload.label && payload.description) {
        const categoryCount = await Category.countDocuments();
        const category = new Category({
            label: payload.label,
            description: payload.description,
            order: (categoryCount * 5)
        });
        await category.save();
        res.send();
    } else {
        res.status(400).send();
    }
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

router.get('/imports/:id', function (req, res, next) {
    const id = req.params.id;
    Import.findById(id).exec((error, importEntity) => {
        if (error) {
            res.status(400).send(error);
        }

        if (importEntity) {
            res.json(importEntity);
        } else {
            res.status(404).send();
        }
    });
});

router.delete('/imports/:id', async function (req, res, next) {
    const id = req.params.id;
    const importEntity = await Import.findById(id);
    if (!importEntity) {
        res.status(404).send();
    } else {
        await deleteMusicByImportId(id);
        importEntity.delete(error => {
            if (error) {
                res.status(400).send();
            } else {
                res.send();
            }
        });
    }
});

router.post('/imports/:id', async function (req, res, next) {
    const id = req.params.id;
    const user = req.userContext;
    const importEntity = await Import.findById(id);
    if (importEntity) {
        await deleteMusicByImportId(id);
        const start = new Date().getTime();
        const importId = importEntity._id.toString();
        const metadata = JSON.parse(importEntity.metadata);
        const folder = metadata.folder;
        const files = metadata.files;
        let importedMusicCount = 0;
        for (let index in files) {
            const file = files[index];

            const trimArtist = file.artist.trim();
            const trimTitle = file.title.trim();
            const musicDocument = {
                artist: trimArtist,
                title: trimTitle,
                file: folder + '/' + file.file,
                artistSanitized: sanitizeMusicElement(trimArtist),
                titleSanitized: sanitizeMusicElement(trimTitle),
                randomInt: getMusicRandomInt(),
                importObjectId: importId
            };

            const musicEntity = new Music(musicDocument);
            musicEntity.save();
            importedMusicCount++;
        }

        importEntity.imported = true;
        importEntity.lastImported = new Date();
        importEntity.lastImportedBy = JSON.stringify({
            id: user._id,
            nickname: user.nickname
        });
        await importEntity.save();

        const duration = new Date().getTime() - start;
        res.json({
            duration: duration,
            importedMusicCount: importedMusicCount
        })
    } else {
        res.status(404).send();
    }
});

router.post('/imports', async function (req, res, next) {
    const payload = req.body;
    const validPayload = validateImportMetadataFormat(payload.metadata);
    if (validPayload) {
        const user = req.userContext;

        const importEntity = new Import({
            metadata: JSON.stringify(payload.metadata),
            imported: false,
            createdBy: JSON.stringify({
                id: user._id,
                nickname: user.nickname
            }),
            creationDate: new Date()
        });
        importEntity.save((errors) => {
            if (errors) {
                res.status(400).send(errors);
            } else {
                res.send();
            }
        });
        return;
    }
    res.status(400).send({message: validPayload});
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
    const query = model.countDocuments({}, (error, count) => {
        if (error) {
            res.status(400).json({message: error});
        } else {
            res.json({count: count});
        }
    });
};

module.exports = router;
