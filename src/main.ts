import fs from "fs";

import { logDebug, logError, logInfo } from "./logger/Logger";
import {
  getMongoDBUri,
  getNodePort,
  getPrivateKey,
  isDebug,
} from "./services/SystemService";
import { app } from "./app";
import mongoose from "mongoose";
import { initServerData } from "./services/InitService";
import http from "http";
import { Server } from "socket.io";

if (!fs.existsSync("./logs")) {
  fs.mkdirSync("./logs");
}

if (isDebug()) {
  logDebug("Server started in DEBUG MODE");
  logDebug("mongodb uri : " + getMongoDBUri());
}

if (!getPrivateKey()) {
  logError("FATAL ERROR: private key is not defined.");
  process.exit(1);
}

const mongoDBUri = getMongoDBUri();
if (!mongoDBUri) {
  logError("FATAL ERROR: MongoDb uri is not defined.");
  process.exit(1);
}

// mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass%20Community&ssl=false
mongoose
  .connect(mongoDBUri, {
    auth: {
      username: "root",
      password: "example",
    },
    dbName: "fmmq",
    // deprecated feature see if cause problem useFindAndModify: false,
    // same as above useUnifiedTopology: true,
    // same here useNewUrlParser: true,
  })
  .then(() => logInfo("Connected to MongoDB..."))
  .catch((err) => {
    logError("FATAL ERROR: Could not connect to MongoDB... " + err);
    process.exit(1);
  });

// initialize FMMQ server
initServerData().catch((e) => logError("can't init server data " + e));

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(getNodePort());
app.set("port", port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Create socket attached to the server
 *
 * Nothing happen on the main namespace
 * each room will open dedicated namespace and listen to the events
 */
export const socket = new Server(server, {
  cors: {
    origin: true,
  },
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: string) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: any) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      logError(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      logError(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind =
    typeof addr === "string" ? "pipe " + addr : "port " + (addr && addr.port);
  logDebug("Listening on " + bind);
}
