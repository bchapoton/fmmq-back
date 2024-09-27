import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import { authMiddleware } from "./middleware/Auth";
import { adminRoleMiddleware } from "./middleware/AdminRole";
import { contributorRoleMiddleWare } from "./middleware/ContributorRole";
import cors from "cors";
import { isDebug } from "./services/SystemService";
import { errorHandlerMiddleware } from "./middleware/ErrorHandler";
import { chatRouter } from "./routes/chat";
import { adminRouter } from "./routes/admin";
import { contributorRouter } from "./routes/contributor";
import { gamesRouter } from "./routes/games";
import { roomsRouter } from "./routes/rooms";
import { authenticationRouter } from "./routes/Authentication";
import { userRouter } from "./routes/users";
import bodyParser from "body-parser";
import { logDebug } from "./logger/Logger";

export const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));
app.use(bodyParser.json());
app.use(cors());

if (isDebug()) {
  logDebug("Server in DEBUG MODE mount debug express router");
  const debugRouter = require("./routes/debug");
  app.use("/debug", debugRouter);
}

app.use("/users", userRouter);
app.use("/admin", authMiddleware, adminRoleMiddleware, adminRouter);
app.use(
  "/contributor",
  authMiddleware,
  contributorRoleMiddleWare,
  contributorRouter,
);
app.use("/rooms", authMiddleware, roomsRouter);
app.use("/games", authMiddleware, gamesRouter);
app.use("/chat", authMiddleware, chatRouter);
app.use("/auth", authenticationRouter);

// error handler
app.use(errorHandlerMiddleware);
