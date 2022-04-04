const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require("cors");
// const mongoose = require('mongoose');
const sqlite3 = require("sqlite3").verbose();
// const db = require("./db")
require("dotenv").config({ path: "./.env" });

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const recipesRouter = require('./routes/recipes');

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/recipes', recipesRouter);


// const REACT_APP_ATLAS_URI=`mongodb+srv://${process.env.REACT_APP_USER_UID}:${process.env.REACT_APP_USER_PWD}@cookbook.zvip3.mongodb.net/cookbook?retryWrites=true&w=majority`

// mongoose.connect(REACT_APP_ATLAS_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
//   .then(() => {
//       console.log("MongoDB connected...")
//   })
//   .catch(err => console.log(err));

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
