const mongoose = require('mongoose');

const ImportSchema = new mongoose.Schema({
    metadata: {
        type: String,
        required: true
    },
    imported: {
        type: String,
        required: true
    },
    lastImported: {
        type: Date,
        default: undefined
    },
    lastImportedBy: {
        type: String,
    },
    ownerId: {
        type: String,
        required: true
    },
    ownerNickname: {
        type: String,
        required: true
    },
    creationDate: {
        type: Date,
        required: true,
        index: true
    },
    categoryId: {
        type: String,
    }
});

ImportSchema.index({ownerId: 1, creationDate: -1});

const Import = mongoose.model('Import', ImportSchema);

exports.Import = Import;