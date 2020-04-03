const express = require('express');
const {Category} = require("../models/category.model");
const router = express.Router();

router.get('/', async (req, res, next) => {
    const categories = await Category.find();
    res.json(categories);
});

module.exports = router;