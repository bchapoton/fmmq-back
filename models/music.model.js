const mongoose = require('mongoose');

const MusicSchema = new mongoose.Schema({
    artist: {
        type: String,
        required: true
    },
    artistSanitized: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    titleSanitized: {
        type: String,
        required: true
    },
    file: {
        type: String,
        required: true
    },
    randomInt: {
        type: Number,
        required: true,
        index: true
    },
    categoryId: {
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
    importObjectId: {
        type: String,
        index: true
    }
});

MusicSchema.index({randomInt: 1, categoryId: 1});
MusicSchema.index({ownerId: 1, artist: 1});

const Music = mongoose.model('Music', MusicSchema);

exports.Music = Music;