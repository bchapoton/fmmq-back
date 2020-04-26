const {UnauthorizedException} = require("../exceptions/UnauthorizedException");
const {ServerErrorException} = require("../exceptions/ServerErrorException");
const {ObjectNotFoundException} = require("../exceptions/ObjectNotFoundException");
const {BadRequestException} = require("../exceptions/BadRequestException");
const {MissingParametersException} = require("../exceptions/MissingParametersException");
module.exports = function (err, req, res, next) {
    if(err instanceof UnauthorizedException) {
        res.status(401).send({message: err.message});
    } else if(err instanceof MissingParametersException) {
        res.status(400).send({message: err.message});
    } else if(err instanceof BadRequestException) {
        res.status(400).send({message: err.message});
    } else if(err instanceof ObjectNotFoundException) {
        res.status(404).send({message: err.message});
    } else if(err instanceof ServerErrorException) {
        res.status(500).send({message: err.message});
    } else {
        res.status(500).send({message: 'Excpect the unexpected something unhandle happen : ' + err.toString()});
    }
    console.error(err);
};