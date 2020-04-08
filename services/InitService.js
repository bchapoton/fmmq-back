const serverConfig = require('../config/server');
const {Music} = require("../models/music.model");
const {Category} = require("../models/category.model");
const {ServerConfig} = require('../models/serverConfig.model');

const initServerData = async () => {
    const serverConfigEntity = await ServerConfig.findOne();
    if(!serverConfigEntity) {
        console.log('initialize server in version ' + serverConfig.version);
        initServerConfig();
        initCategory();
        initMusic();
    } else {
        console.log('FMMQ server v' + serverConfigEntity.version);
    }
};

const initServerConfig = () => {
    const serverConfigEntity = new ServerConfig({
        version: serverConfig.version,
        creationDate: new Date()
    });
    serverConfigEntity.save();
};

const initCategory = () => {
    const category = new Category({
        label: 'Tout',
        description: 'Toutes les musiques du serveur dans une salle'
    });
    category.save();
    const category2 = new Category({
        label: 'Année 2000',
        description: 'Catégorie de test vide'
    });
    category2.save();
};

const initMusic = () => {
    const music = new Music({
        artist: 'Britney spears',
        title: 'Oops I did it again',
        file: 'file.mp3'
    });
    music.save();
    const music1 = new Music({
        artist: 'Kmaro',
        title: 'Femme like you',
        file: 'file.mp3'
    });
    music1.save();
    const music2 = new Music({
        artist: 'Kenza farah',
        title: 'kenza',
        file: 'file.mp3'
    });
    music2.save();
    const music3 = new Music({
        artist: 'Jean jacques goldman',
        title: 'libère moi',
        file: 'file.mp3'
    });
    music3.save();
};

exports.initServerData = initServerData;