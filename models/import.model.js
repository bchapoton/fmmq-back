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
    createdBy: {
        type: String,
        required: true
    },
    creationDate: {
        type: Date,
        required: true
    }
});

const Import = mongoose.model('Import', ImportSchema);

exports.Import = Import;