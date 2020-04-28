const mongoose = require('mongoose');

const ServerConfigSchema = new mongoose.Schema({
    version: {
        type: Number,
        required: true
    },
    creationDate: {
        type: Date,
        required: true
    },
    updateDate: {
        type: Date,
        default: null
    }
});

const ServerConfig = mongoose.model('ServerConfig', ServerConfigSchema);

exports.ServerConfig = ServerConfig;