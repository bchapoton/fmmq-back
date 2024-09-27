import { ObjectNotFoundException } from "../exceptions/ObjectNotFoundException";
import { MissingParametersException } from "../exceptions/MissingParametersException";
import { IUser, User } from "../models/user.model";
import { NextFunction } from "express";
import { HydratedDocument } from "mongoose";

export function findUserById(
  nextFunction: NextFunction,
  id: string,
  success: (user: HydratedDocument<IUser> | null) => void,
) {
  if (id) {
    User.findById(id)
      .exec()
      .then((value) => {
        success(value);
      })
      .catch(() => {
        nextFunction(
          new ObjectNotFoundException("Can't find user with id : " + id),
        );
      });
  } else {
    nextFunction(new MissingParametersException("Missing User id"));
  }
}

export async function putUserRole(
  nextFunction: NextFunction,
  id: string,
  role: string,
) {
  findUserById(nextFunction, id, (userEntity) => {
    if (userEntity) {
      userEntity.role = role;
      userEntity.save();
    }
  });
}
