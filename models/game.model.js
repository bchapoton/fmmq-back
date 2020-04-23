const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    categoryLabel: {
        type: String,
        required: true
    },
    categoryId: {
        type: String,
        required: true
    },
    podium: {
        type: String,
        required: true
    },
    leaderBoard: {
        type: String,
        required: true
    },
    musicScheme: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    }
});

const Game = mongoose.model('Game', GameSchema);

exports.Game = Game;