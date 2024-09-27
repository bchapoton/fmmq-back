import express, { Request, Response } from "express";

import { ServerConfig } from "../models/serverConfig.model";
import { Game } from "../models/game.model";
import { Music } from "../models/music.model";
import { getPagerFromRequest } from "../services/NetworkUtils";
import { User } from "../models/user.model";
import { Category } from "../models/category.model";
import { serverConfig } from "../config/server";
import { findUserById, putUserRole } from "../services/UserService";
import {
  createImport,
  deleteImport,
  doImport,
  findImportById,
} from "../services/ImportService";
import { categoryService } from "../services/CategoryService";
import { Import } from "../models/import.model";
import {
  delMusicDuplicates,
  getMusicDuplicates,
  reSanitizeDB,
} from "../services/AdministrationService";
import { isDebug } from "../services/SystemService";
import { cacheService } from "../services/CacheService";
import { ObjectNotFoundException } from "../exceptions/ObjectNotFoundException";
import { Model } from "mongoose";
import { MissingParametersException } from "../exceptions/MissingParametersException";

export const adminRouter = express.Router();

adminRouter.get("/count/:type", function (req, res, next) {
  const type = req.params.type;
  let model;
  if (type === "users") {
    model = User;
  } else if (type === "categories") {
    model = Category;
  } else if (type === "musics") {
    model = Music;
  } else if (type === "games") {
    model = Game;
  } else if (type === "imports") {
    model = Import;
  } else {
    res.status(404).json({ message: "can't count type : " + type });
    return;
  }

  model
    .countDocuments()
    .then((count) => {
      res.json({ count: count });
    })
    .catch((err) => {
      res.status(400).json({ message: err });
    });
});

adminRouter.get("/users", function (req, res, next) {
  adminListObjects(res, req, User, "nickname");
});

adminRouter.get("/users/:id", function (req, res, next) {
  const id = req.params.id;
  findUserById(next, id, (user) => {
    res.json(user);
  });
});

adminRouter.put(
  "/users/:id",
  async function (
    req: Request<{ id: string }, {}, { role?: string }>,
    res,
    next,
  ) {
    const id = req.params.id;
    if (req.body.role) {
      await putUserRole(next, id, req.body.role);
      res.send();
    } else {
      next(new MissingParametersException("Missing role parameter"));
    }
  },
);

adminRouter.get("/categories", function (req, res, next) {
  adminListObjects(res, req, Category, "label");
});

adminRouter.get("/categories/:id", async function (req, res, next) {
  categoryService
    .findById(req.params.id)
    .then((category) => res.json(category))
    .catch(next);
});

adminRouter.put("/categories/:id", async function (req, res, next) {
  categoryService
    .updateCategory(req.params.id, req.body)
    .then(() => res.json())
    .catch(next);
});

adminRouter.post("/categories", async function (req, res, next) {
  categoryService
    .createCategory(req.body)
    .then(() => res.json())
    .catch(next);
});

adminRouter.delete("/categories/:id", async function (req, res, next) {
  categoryService
    .delete(req.params.id)
    .then(() => res.json())
    .catch(next);
});

adminRouter.get("/musics", function (req, res, next) {
  adminListObjects(res, req, Music, "artist");
});

adminRouter.post("/musics/reSanitizeDB", async function (req, res, next) {
  const start = new Date().getTime();
  let result = await reSanitizeDB();
  const duration = new Date().getTime() - start;
  res.json(Object.assign(result, { duration: duration }));
});

adminRouter.get("/musics/duplicates", async function (req, res, next) {
  const start = new Date().getTime();
  let result = await getMusicDuplicates();
  const duration = new Date().getTime() - start;
  res.json(Object.assign(result, { duration: duration }));
});

adminRouter.delete("/musics/duplicates", async function (req, res, next) {
  const start = new Date().getTime();
  let result = await delMusicDuplicates();
  const duration = new Date().getTime() - start;
  res.json(Object.assign(result, { duration: duration }));
});

adminRouter.delete("/musics/all", async function (req, res, next) {
  const start = new Date().getTime();
  await Music.db.dropCollection("musics");
  const duration = new Date().getTime() - start;
  res.json(
    Object.assign({ message: "All musics dropped" }, { duration: duration }),
  );
});

adminRouter.get("/games", function (req, res, next) {
  adminListObjects(res, req, Game, "-date");
});

adminRouter.get("/imports", function (req, res, next) {
  adminListObjects(res, req, Import, "-creationDate");
});

adminRouter.get("/imports/:id", async function (req, res, next) {
  const id = req.params.id;
  findImportById(next, id, (importEntity) => {
    res.json(importEntity);
  });
});

adminRouter.delete("/imports/:id", async function (req, res, next) {
  const id = req.params.id;
  await deleteImport(next, id);
  res.send();
});

adminRouter.post("/imports/:id", async function (req, res, next) {
  const id = req.params.id;
  const user = req.userContext;
  const report = await doImport(next, user, id);
  res.json(report);
});

adminRouter.post("/imports", async function (req, res, next) {
  const payload = req.body;
  const user = req.userContext;
  await createImport(next, user, payload);
  res.send();
});

adminRouter.get("/serverconfig", function (_, res, next) {
  const query = ServerConfig.findOne()
    .exec()
    .then((serverConfigEntity) => {
      if (!serverConfigEntity) {
        next(new ObjectNotFoundException("Can't find server config"));
      } else {
        res.json({
          codeVersion: serverConfig.version,
          dbVersion: serverConfigEntity.version,
          creation: serverConfigEntity.creationDate,
          debug: isDebug(),
        });
      }
    })
    .catch(next);
});

adminRouter.get("/cache/objects", function (req, res, next) {
  const roomIds = cacheService.getRoomIds();
  const rooms = [];
  for (let index in roomIds) {
    const roomId = roomIds[index];
    const room = cacheService.findRoom(roomId);
    rooms.push({
      categoryId: room.getCategoryId(),
      categoryLabel: room.categoryLabel,
      players: room.countPlayers(),
      currentMusicIndex: room.getCurrentMusicIndexFromZero(),
      musicSchemeLength: room.getMusicSchemeLength(),
    });
  }

  res.json({
    rooms,
    categoryMusicsCounters: cacheService.getCategoryMusicsCounters(),
  });
});

adminRouter.get("/cache/objects/:roomId", function (req, res, next) {
  const roomId = req.params.roomId;
  const room = cacheService.findRoom(roomId);
  if (room) {
    res.json(room.toJSON());
  } else {
    next(new ObjectNotFoundException("Can't find the room"));
  }
});

function adminListObjects(
  res: Response,
  req: Request,
  model: Model<any>,
  sort: string,
) {
  const pager = getPagerFromRequest(req);
  const query = model.find().sort(sort).skip(pager.start).limit(pager.limit);

  query
    .exec()
    .then((values) => {
      res.json(values);
    })
    .catch((reason) => {
      res.status(400).json({ message: reason });
    });
}
