import { ROLE_CONTRIBUTOR } from "../constant/roles";
import { NextFunction, Request, Response } from "express";

export function contributorRoleMiddleWare(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const user = req.userContext;
  if (user && user.role === ROLE_CONTRIBUTOR) {
    next();
  } else {
    res.status(401).json({ message: "Access Denied" });
  }
}
