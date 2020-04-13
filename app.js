const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const authMiddleware = require('./middleware/Auth');
const cors = require('cors');
const {isDebug} = require("./services/SystemService");
const debug = require('debug')('quiz:server');

const usersRouter = require('./routes/users');
const gamesRouter = require('./routes/games');
const authenticationRouter = require('./routes/Authentication')

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(cors());

if(isDebug()) {
    debug('Server started in DEBUG MODE');
    const debugRouter = require('./routes/debug');
    app.use('/debug', debugRouter);
}

app.use('/users', usersRouter);
app.use('/rooms', authMiddleware, gamesRouter);
app.use('/auth', authenticationRouter);

module.exports = app;
