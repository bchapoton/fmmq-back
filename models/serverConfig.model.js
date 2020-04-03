const mongoose = require('mongoose');

const ServerConfigSchema = new mongoose.Schema({
    version: {
        type: Number,
        required: true
    },
    creationDate: {
        type: Date,
        required: true
    }
});

const ServerConfig = mongoose.model('ServerConfig', ServerConfigSchema);

exports.ServerConfig = ServerConfig;