import express from "express";
import bcrypt from "bcrypt";
import { User } from "../models/user.model";
import { RefreshToken } from "../models/refreshToken.model";
import { logError } from "../logger/Logger";
import {
  decodeToken,
  generateJWT,
  generateRefreshToken,
} from "../services/AuthService";

export const authenticationRouter = express.Router();

/**
 * Login route
 */
authenticationRouter.post("/login", async function (req, res) {
  if (req.body.email && req.body.password) {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      bcrypt.compare(req.body.password, user.password, async (_, result) => {
        if (result) {
          const refreshToken = await generateRefreshToken(user);
          res.send({
            token: generateJWT(user),
            refreshToken: refreshToken,
          });
        } else {
          res.status(400).send({ message: "Bad credentials" });
        }
      });
      return;
    }
  }
  res.status(400).send({ message: "Bad credentials" });
});

/**
 * Sign-in route
 */
authenticationRouter.post("/sign-up", async function (req, res) {
  if (req.body.email && req.body.password && req.body.nickname) {
    const errors = [];
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      errors.push({ field: "email", message: "L'email est déjà enregistré" });
    }

    user = await User.findOne({ nickname: req.body.nickname });
    if (user) {
      errors.push({
        field: "nickname",
        message: "Le pseudo est déjà enregistré",
      });
    }

    if (errors.length > 0) {
      res.status(400).json({ errors: errors });
      return;
    }

    bcrypt.hash(req.body.password, 8, async (_, hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
        nickname: req.body.nickname,
      });
      await user.save();
      res.status(204).send();
    });
  }
});

/**
 * Refresh token
 */
authenticationRouter.post("/refresh", async function (req, res) {
  if (req.body.refreshToken && req.body.token) {
    try {
      let decoded = decodeToken(req.body.token);
      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        logError(
          "user is not defined on refresh token, decoded jwt : " + decoded,
        );
        res.status(401).send({ message: "Access Denied" });
        return;
      }
      const refreshTokenEntity = await RefreshToken.findOne({
        refreshToken: req.body.refreshToken,
        user: user._id,
      });
      if (!refreshTokenEntity) {
        logError("can't find refreshTokenEntity, decoded jwt : " + decoded);
        res.status(401).send({ message: "Access Denied" });
        return;
      }
      refreshTokenEntity.deleteOne();
      const newRefreshToken = await generateRefreshToken(user);
      const newToken = generateJWT(user);
      res.send({ token: newToken, refreshToken: newRefreshToken });
      return;
    } catch (e) {
      // nothing to do handled bellow
      logError("exception occured on refresh token endpoint : " + e);
    }
  }
  res.status(401).send({ message: "Access Denied" });
});

/**
 * logout
 * TODO token stateless surement à supprimer : mettre en place un cache pour signer chaque token individuellement
 */
authenticationRouter.post("/logout", function (_, res) {
  res.send("respond with a resource");
});
