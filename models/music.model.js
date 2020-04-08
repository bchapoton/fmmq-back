const mongoose = require('mongoose');

const MusicSchema = new mongoose.Schema({
    artist: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    file: {
        type: String,
        required: true
    },
});

const Music = mongoose.model('Music', MusicSchema);

exports.Music = Music;