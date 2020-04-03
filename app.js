const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const authMiddleware = require('./middleware/Auth');
const cors = require('cors');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const categoriesRouter = require('./routes/categories');
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

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/categories', authMiddleware, categoriesRouter);
app.use('/play', gamesRouter);
app.use('/auth', authenticationRouter);

module.exports = app;
