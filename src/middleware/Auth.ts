import { checkTokenValidity } from "../services/AuthService";
import { NextFunction, Request, Response } from "express";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.headers["authorization"];
  if (checkTokenValidity(token, req, res)) {
    next();
  }
}
