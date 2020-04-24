const {ROLE_ADMIN} = require("../constant/roles");

module.exports = function(req, res, next) {
    const user = req.userContext;
    if(user && user.role === ROLE_ADMIN) {
        next();
    } else {
        res.status(401).json({message: 'Access Denied'});
    }
};