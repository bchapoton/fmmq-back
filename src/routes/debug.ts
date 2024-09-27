import express from "express";

export const debugRouter = express.Router();

debugRouter.get('/', async function (req, res, next) {
    res.json({debug: true});
});
