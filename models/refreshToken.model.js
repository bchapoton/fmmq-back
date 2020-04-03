const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
    refreshToken: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectID,
        required: true
    },
    creationDate: {
        type: Date,
        required: true
    }
});

const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);

exports.RefreshToken = RefreshToken;