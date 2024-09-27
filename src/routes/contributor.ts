import express, { NextFunction, Request, Response } from "express";
import { BadRequestException } from "../exceptions/BadRequestException";
import { Music } from "../models/music.model";
import { getPagerFromRequest } from "../services/NetworkUtils";
import { UnauthorizedException } from "../exceptions/UnauthorizedException";
import {
  createImport,
  deleteImport,
  doImport,
  findImportById,
} from "../services/ImportService";
import { Import } from "../models/import.model";
import { ObjectNotFoundException } from "../exceptions/ObjectNotFoundException";
import { UserRequestContext } from "../custom.express";
import { Model } from "mongoose";

export const contributorRouter = express.Router();

contributorRouter.get("/count/:type", function (req, res, next) {
  const type = req.params.type;
  const user = req.userContext;
  let model;
  if (type === "musics") {
    model = Music;
  } else if (type === "imports") {
    model = Import;
  } else {
    next(new BadRequestException("can't count type : " + type));
    return;
  }
  contributorCountObjects(user, res, model);
});

contributorRouter.get("/musics", function (req, res, next) {
  const pager = getPagerFromRequest(req);
  const user = req.userContext;
  if (!user) {
    return next(new UnauthorizedException());
  }
  // this is the import owner who drive the right, if an admin relaunch the import, we need the contributor still see his music
  // keep the sort, there is an index on ownerId and creationDate
  Import.find({ ownerId: user._id })
    .sort("-creationDate")
    .exec()
    .then((importEntities) => {
      const importIds = importEntities.map((importEntity) =>
        importEntity._id.toString(),
      );
      if (importIds.length === 0) {
        res.json([]);
      } else {
        Music.find()
          .where("importObjectId")
          .in(importIds)
          .sort("artist")
          .skip(pager.start)
          .limit(pager.limit)
          .exec()
          .then((values) => {
            res.json(values);
          })
          .catch(next);
      }
    });
});

contributorRouter.get("/imports", function (req, res, next) {
  const pager = getPagerFromRequest(req);
  const user = req.userContext as UserRequestContext;
  Import.find({ ownerId: user._id })
    .sort("-creationDate")
    .skip(pager.start)
    .limit(pager.limit)
    .exec()
    .then((values) => res.json(values))
    .catch(next);
});

contributorRouter.get("/imports/:id", async function (req, res, next) {
  const id = req.params.id;
  const user = getContributorUserContext(next, req);
  findImportById(next, id, (importEntity) => {
    if (!importEntity) {
      next(new ObjectNotFoundException());
    } else if (user && importEntity.ownerId === user._id.toString()) {
      res.json(importEntity);
    } else {
      next(new UnauthorizedException("Unauthorized"));
    }
  });
});

contributorRouter.delete("/imports/:id", async function (req, res, next) {
  const id = req.params.id;
  await deleteImport(next, id, getContributorUserContext(next, req));
  res.send();
});

contributorRouter.post("/imports/:id", async function (req, res, next) {
  const id = req.params.id;
  const user = req.userContext;
  const report = await doImport(
    next,
    user,
    id,
    getContributorUserContext(next, req),
  );
  res.json(report);
});

contributorRouter.post("/imports", async function (req, res, next) {
  const payload = req.body;
  const user = req.userContext;
  await createImport(next, user, payload);
  res.send();
});

const contributorCountObjects = (
  user: UserRequestContext | undefined,
  res: Response,
  model: Model<any>,
) => {
  if (user) {
    model
      .countDocuments({ ownerId: user._id })
      .exec()
      .then((count) => res.json({ count: count }))
      .catch((error) => res.status(500).json({ message: error }));
  }
};

function getContributorUserContext(errorHandler: NextFunction, req: Request) {
  if (req.userContext) {
    return req.userContext;
  }
  errorHandler(new UnauthorizedException());
  return;
}
