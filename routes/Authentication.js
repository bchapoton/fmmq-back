const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const {User} = require('../models/user.model');
const {RefreshToken} = require('../models/refreshToken.model');
const AuthService = require('../services/AuthService');

/**
 * Login route
 */
router.post('/login', async function (req, res, next) {
    const payload = req.body;

    if (req.body.email && req.body.password) {
        const user = await User.findOne({email: req.body.email});
        if (user) {
            bcrypt.compare(
                req.body.password,
                user.password,
                async (err, result) => {
                    if (result) {
                        const refreshToken = await AuthService.generateRefreshToken(user);
                        res.send(
                            {
                                token: AuthService.generateJWT(user),
                                refreshToken: refreshToken
                            }
                        );
                    } else {
                        res.status(400).send({message: 'Bad credentials'});
                    }
                });
            return;
        }
    }
    res.status(400).send({message: 'Bad credentials'});
});

/**
 * Sign-in route
 */
router.post('/sign-up', async function (req, res, next) {
    if (req.body.email && req.body.password && req.body.nickname) {
        const errors = [];
        let user = await User.findOne({email: req.body.email});
        if (user) {
            errors.push({field: 'email', message: "L'email est déjà enregistré"});
        }

        user = await User.findOne({nickname: req.body.nickname});
        if (user) {
            errors.push({field: 'nickname', message: "Le pseudo est déjà enregistré"});
        }

        if (errors.length > 0) {
            res.status(400).json({errors: errors});
            return;
        }

        bcrypt.hash(req.body.password, 8, async (err, hash) => {
            const user = new User({
                email: req.body.email,
                password: hash,
                nickname: req.body.nickname
            });
            await user.save();
            res.status(204).send();
        });
    }
});

/**
 * Refresh token
 */
router.post('/refresh', async function (req, res, next) {
    if (req.body.refreshToken && req.body.token) {
        try {
            let decoded = AuthService.decodeToken(req.body.token);
            const user = await User.findOne({email: decoded.email});
            if (!user) {
                throw 'Access Denied'
            }
            const refreshTokenEntity = await RefreshToken.findOne({refreshToken: req.body.refreshToken, user: user._id});
            if (!refreshTokenEntity) {
                throw 'Access Denied'
            }
            refreshTokenEntity.delete();
            const newRefreshToken = await AuthService.generateRefreshToken(user);
            const newToken = AuthService.generateJWT(user);
            res.send({token: newToken, refreshToken: newRefreshToken});
            return;
        } catch (e) {
            // nothing to do handled bellow
            console.error('exception occured : ' + e );
        }
    }
    res.status(401).send({message: 'Access Denied'});
});

/**
 * logout
 * TODO token stateless surement à supprimer : mettre en place un cache pour signer chaque token individuellement
 */
router.post('/logout', function (req, res, next) {
    res.send('respond with a resource');
});

module.exports = router;