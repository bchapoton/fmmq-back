const mongoose = require('mongoose');

const ImportSchema = new mongoose.Schema({
    folder: {
        type: String,
        required: true
    },
    metadata: {
        type: String,
        required: true
    },
    imported: {
        type: String,
        required: true
    }
});

const Import = mongoose.model('Import', ImportSchema);

exports.Import = Import;