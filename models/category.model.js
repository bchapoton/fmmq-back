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
});

const Category = mongoose.model('Category', CategorySchema);

exports.Category = Category;