const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const authMiddleware = require('./middleware/Auth');
const adminRoleMiddleWare = require('./middleware/AdminRole');
const contributorRoleMiddleWare = require('./middleware/ContributorRole');
const cors = require('cors');
const {isDebug} = require("./services/SystemService");
const errorHandler = require('./middleware/ErrorHandler');

const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const contributorRouter = require('./routes/contributor');
const gamesRouter = require('./routes/games');
const roomsRouter = require('./routes/rooms');
const authenticationRouter = require('./routes/Authentication');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
const bodyParser = require('body-parser');
const {logDebug} = require("./logger/Logger");
app.use(bodyParser.json());
app.use(cors());

if(isDebug()) {
    logDebug('Server in DEBUG MODE mount debug express router');
    const debugRouter = require('./routes/debug');
    app.use('/debug', debugRouter);
}

app.use('/users', usersRouter);
app.use('/admin', authMiddleware, adminRoleMiddleWare, adminRouter);
app.use('/contributor', authMiddleware, contributorRoleMiddleWare, contributorRouter);
app.use('/rooms', authMiddleware, roomsRouter);
app.use('/games', authMiddleware, gamesRouter);
app.use('/auth', authenticationRouter);

// error handler
app.use(errorHandler);

module.exports = app;
