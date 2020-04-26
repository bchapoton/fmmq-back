var express = require('express');
const {BadRequestException} = require("../exceptions/BadRequestException");
const {Game} = require("../models/game.model");
const {Music} = require("../models/music.model");
const {getPagerFromRequest} = require("../services/NetworkUtils");
const {User} = require("../models/user.model");
const {Category} = require("../models/category.model");
const {UnauthorizedException} = require("../exceptions/UnauthorizedException");
const {createImport} = require("../services/ImportService");
const {deleteImport} = require("../services/ImportService");
const {findImportById} = require("../services/ImportService");
const {doImport} = require("../services/ImportService");
const {Import} = require("../models/import.model");
const router = express.Router();

router.get('/count/:type', function (req, res, next) {
    const type = req.params.type;
    const user = req.userContext;
    let model;
    if (type === 'musics') {
        model = Music;
    } else if (type === 'imports') {
        model = Import;
    } else {
        next(new BadRequestException("can't count type : " + type));
        return;
    }
    contributorCountObjects(user, res, model);
});

router.get('/musics', function (req, res, next) {
    const pager = getPagerFromRequest(req);
    const user = req.userContext;
    const query = Music.find({ownerId: user._id}).sort('artist').skip(pager.start).limit(pager.limit);
    query.exec((error, values) => {
        if (error) {
            res.status(400).json({message: error});
        } else {
            res.json(values);
        }
    });
});

router.get('/imports', function (req, res, next) {
    const pager = getPagerFromRequest(req);
    const user = req.userContext;
    const query = Import.find({ownerId: user._id}).sort('-creationDate').skip(pager.start).limit(pager.limit);
    query.exec((error, values) => {
        if (error) {
            res.status(400).json({message: error});
        } else {
            res.json(values);
        }
    });
});

router.get('/imports/:id', async function (req, res, next) {
    const id = req.params.id;
    const user = getContributorUserContext(next, req);
    findImportById(next, id, (importEntity) => {
        if(importEntity.ownerId === user._id) {
            res.json(importEntity);
        } else {
            next(new UnauthorizedException('Unauthorized'));
        }
    });
});

router.delete('/imports/:id', async function (req, res, next) {
    const id = req.params.id;
    await deleteImport(next, id, getContributorUserContext(next, req));
    res.send();
});

router.post('/imports/:id', async function (req, res, next) {
    const id = req.params.id;
    const user = req.userContext;
    const report = await doImport(next, user, id, getContributorUserContext(next, req));
    res.json(report);
});

router.post('/imports', async function (req, res, next) {
    const payload = req.body;
    const user = req.userContext;
    await createImport(next, user, payload);
    res.send();
});

const contributorCountObjects = (user, res, model) => {
    model.countDocuments({ownerId: user._id}, (error, count) => {
        if (error) {
            res.status(400).json({message: error});
        } else {
            res.json({count: count});
        }
    });
};

function getContributorUserContext(errorHandler, req) {
    if(req.userContext) {
        return req.userContext;
    }
    errorHandler(new UnauthorizedException());
}

module.exports = router;
