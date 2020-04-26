const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const querystring = require('querystring');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authenticateSpotifyRouter = require('./routes/authenticateSpotify');
const loginRouter = require('./routes/login');
const loginRenRouter = require('./routes/loginRen');
const callbackRouter = require('./routes/callbackSpotify');
const refreshTokenRouter = require('./routes/refreshToken');
const authenticateGoogleRouter = require('./routes/authenticateGoogle');
const callbackgoogleRouter = require('./routes/callbackGoogle');
const registerRouter = require('./routes/register');
const registerRenRouter = require('./routes/registerRen');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/login', loginRouter);

app.use('/loginRen', loginRenRouter);

app.use('/callback', callbackRouter);

app.use('/refreshToken', refreshTokenRouter);

app.use('/authenticateGoogle', authenticateGoogleRouter);

app.use('/callbackgoogle', callbackgoogleRouter);

app.use('/authenticateSpotify', authenticateSpotifyRouter);

app.use('/register', registerRouter);

app.use('/registerRen', registerRenRouter);

app.use('/', indexRouter);
// app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
