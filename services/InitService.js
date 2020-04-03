const serverConfig = require('../config/server');
const {Category} = require("../models/category.model");
const {ServerConfig} = require('../models/serverConfig.model');

const initServerData = async () => {
    const serverConfigEntity = await ServerConfig.findOne();
    if(!serverConfigEntity) {
        console.log('initialize server in version ' + serverConfig.version);
        initServerConfig();
        initCategory();
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
        label: 'Tout'
    });
    category.save();
};

exports.initServerData = initServerData;