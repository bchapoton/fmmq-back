const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {getPrivateKey} = require("./SystemService");
const {RefreshToken} = require("../models/refreshToken.model");

const generateJWT = (user) => {
    const tokenDate = getCurrentTime();
    return generateJWTFromPayload({
        _id: user._id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
        tokenDate: tokenDate,
        expire: getTWTExpireInMilliseconds(tokenDate),
    });
};

const generateJWTFromPayload = (payload) => {
    return jwt.sign(payload,
        getPrivateKey()); //get the private key from the config file -> environment variable
};

const checkTokenValidity = (token, req, res) => {
    if(!token) {
        res.status(401).send({message: 'Access Denied'});
        return false;
    }

    try {
        //if can verify the token, set req.user and pass to next middleware
        const decoded = decodeToken(token);
        const currentTime = getCurrentTime();
        if(decoded.expire > currentTime) {
            const refreshedToken = Object.assign(decoded, {
                tokenDate: currentTime,
                expire: getTWTExpireInMilliseconds(currentTime)
            });
            res.set('x-token', generateJWTFromPayload(refreshedToken));
            req.userContext = decoded;
            return true;
        }
        res.stat(400).send({message: 'token expired'});
        return false;
    } catch (ex) {
        //if invalid token
        res.status(401).send({message: 'Access Denied'});
    }
};

const decodeToken = (token) => {
  return jwt.decode(token, getPrivateKey());
};

/**
 * Token validity in second
 */
const getTokenValidity = () => {
    return 300; // 5mn
};

const getTWTExpireInMilliseconds = (tokenDate) => {
    return tokenDate + (getTokenValidity() * 1000);
};

const generateRefreshToken = async (user) => {
    if(user) {
        const randomBytes = await crypto.randomBytes(128);
        const token = randomBytes.toString('hex');
        const refreshToken = new RefreshToken({
            refreshToken: token,
            creationDate: getCurrentTime(),
            user: user._id
        });
        refreshToken.save();
        return token;
    }
};

function getCurrentTime() {
    return (new Date()).getTime();
}

exports.generateJWT = generateJWT;
exports.checkTokenValidity = checkTokenValidity;
exports.decodeToken = decodeToken;
exports.generateRefreshToken = generateRefreshToken;