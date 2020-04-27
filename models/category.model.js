const Joi = require('joi');
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    label: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        index: true
    },
    allMusicsOnServer: {
        type: Boolean,
        default: true
    }
});

const Category = mongoose.model('Category', CategorySchema);

exports.Category = Category;