const serverConfig = require('../config/server');
const {logInfo} = require("../logger/Logger");
const {sanitizeMusicElement} = require("./GameService");
const {Music} = require("../models/music.model");
const {Category} = require("../models/category.model");
const {ServerConfig} = require('../models/serverConfig.model');

const initServerData = async () => {
    const serverConfigEntity = await ServerConfig.findOne();
    if(!serverConfigEntity) {
        logInfo('initialize server in version ' + serverConfig.version);
        initServerConfig();
        initCategory();
        initMusic();
    } else {
        logInfo('FMMQ server v' + serverConfigEntity.version);
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
    const musics = [
        {
            artist: 'R. Kelly',
            title: 'If I Could Turn Back The Hands Of Time',
            file: 'music/0004037.mp3'
        },
        {
            artist: 'Eiffel 65',
            title: 'Move Your Body',
            file: 'music/0004060.mp3'
        },
        {
            artist: 'Robbie Williams',
            title: "She's The One",
            file: 'music/0004070.mp3'
        },
        {
            artist: 'Christina Aguilera',
            title: 'What A Girl Wants',
            file: 'music/0004074.mp3'
        }
    ];

    musics.forEach(music => {
        const musicEntity = new Music(
            Object.assign({},
                music,
                {
                    artistSanitized: sanitizeMusicElement(music.artist),
                    titleSanitized: sanitizeMusicElement(music.title)
                })
        );
        musicEntity.save();
    });
};

exports.initServerData = initServerData;