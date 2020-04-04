const jwt = require('jsonwebtoken');
const config = require('config');
const crypto = require('crypto');
const {RefreshToken} = require("../models/refreshToken.model");

const generateJWT = (user) => {
    const tokenDate = new Date().getTime();
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

const checkTokenValidity = (token, res) => {
    if(!token) {
        res.status(401).send({message: 'Access Denied'});
        return false;
    }

    try {
        //if can verify the token, set req.user and pass to next middleware
        const decoded = decodeToken(token);
        const tokenExpirationTimestamp = decoded.iat + getTokenValidity();
        if(decoded.tokenDate && tokenExpirationTimestamp > (new Date().getTime() / 1000)) {
            const refreshedToken = Object.assign(decoded, {tokenDate: new Date()});
            res.header('x-token', generateJWTFromPayload(refreshedToken));
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

const getPrivateKey = () => {
    return config.get('FMMQ-private-key');
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
            creationDate: new Date(),
            user: user._id
        });
        refreshToken.save();
        return token;
    }
};

exports.generateJWT = generateJWT;
exports.checkTokenValidity = checkTokenValidity;
exports.decodeToken = decodeToken;
exports.getPrivateKey = getPrivateKey;
exports.generateRefreshToken = generateRefreshToken;