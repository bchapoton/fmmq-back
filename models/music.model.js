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
        required: true
    }
});

const Music = mongoose.model('Music', MusicSchema);

exports.Music = Music;