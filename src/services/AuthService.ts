import { HydratedDocument } from "mongoose";
import { IUser } from "../models/user.model";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { getPrivateKey } from "./SystemService";
import { RefreshToken } from "../models/refreshToken.model";
import { Request, Response } from "express";
import { UserRequestContext } from "../custom.express";

export const generateJWT = (user: HydratedDocument<IUser>) => {
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

const generateJWTFromPayload = (payload: UserRequestContext) => {
  return jwt.sign(payload, getPrivateKey()); //get the private key from the config file -> environment variable
};

export const checkTokenValidity = (
  token: string | undefined,
  req: Request,
  res: Response,
) => {
  if (!token) {
    res.status(401).send({ message: "Access Denied" });
    return false;
  }

  try {
    //if can verify the token, set req.user and pass to next middleware
    const decoded = decodeToken(token);
    const currentTime = getCurrentTime();
    if (decoded.expire > currentTime) {
      /* TODO see why we do that back in a day
      const refreshedToken = Object.assign(decoded, {
        tokenDate: currentTime,
        expire: getTWTExpireInMilliseconds(currentTime),
      });
       */
      req.userContext = decoded;
      return true;
    }
    res.status(400).send({ message: "token expired" });
    return false;
  } catch (ex) {
    //if invalid token
    res.status(401).send({ message: "Access Denied" });
    return false;
  }
};

/**
 * Token validity in second
 */
const getTokenValidity = () => {
  return 300; // 5mn
};

const getTWTExpireInMilliseconds = (tokenDate: number) => {
  return tokenDate + getTokenValidity() * 1000;
};

export const generateRefreshToken = async (user: HydratedDocument<IUser>) => {
  const randomBytes = crypto.randomBytes(128);
  const token = randomBytes.toString("hex");
  const refreshToken = new RefreshToken({
    refreshToken: token,
    creationDate: getCurrentTime(),
    user: user._id,
  });
  return refreshToken.save().then(() => token);
};

function getCurrentTime() {
  return new Date().getTime();
}

export function decodeToken(token: string) {
  return jwt.verify(token, getPrivateKey()) as UserRequestContext;
}
