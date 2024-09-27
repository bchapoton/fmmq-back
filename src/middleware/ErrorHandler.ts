import { UnauthorizedException } from "../exceptions/UnauthorizedException";
import { ServerErrorException } from "../exceptions/ServerErrorException";
import { ObjectNotFoundException } from "../exceptions/ObjectNotFoundException";
import { BadRequestException } from "../exceptions/BadRequestException";
import { MissingParametersException } from "../exceptions/MissingParametersException";
import { NextFunction, Request, Response } from "express";
import { logError } from "../logger/Logger";

export function errorHandlerMiddleware(
  err: any,
  _: Request,
  res: Response,
  // @ts-ignore
  next: NextFunction,
) {
  if (err instanceof UnauthorizedException) {
    res.status(401).send({ message: err.message });
  } else if (err instanceof MissingParametersException) {
    res.status(400).send({ message: err.message });
  } else if (err instanceof BadRequestException) {
    res.status(400).send({ message: err.message });
  } else if (err instanceof ObjectNotFoundException) {
    res.status(404).send({ message: err.message });
  } else if (err instanceof ServerErrorException) {
    res.status(500).send({ message: err.message });
  } else {
    res.status(500).send({
      message:
        "Expect the unexpected something unhandled happen : " + err.toString(),
    });
  }
  logError(err);
}
