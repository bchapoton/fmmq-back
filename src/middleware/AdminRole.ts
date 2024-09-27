import { ROLE_ADMIN } from "../constant/roles";
import { NextFunction, Request, Response } from "express";

export function adminRoleMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const user = req.userContext;
  if (user && user.role === ROLE_ADMIN) {
    next();
  } else {
    res.status(401).json({ message: "Access Denied" });
  }
}
