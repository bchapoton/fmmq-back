const AuthService = require('../services/AuthService');

module.exports = function(req, res, next) {
    const token = req.headers["authorization"];
    if(AuthService.checkTokenValidity(token, req, res)) {
        next();
    }
};