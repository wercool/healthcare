var express = require('express');
var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

//handle static public resources
app.use(express.static(__dirname + '/public'));

// include routes
var router = require('./routes/router');
app.use('/', router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json('error', {
    message: err.message,
    error: {}
  });
});

// listen on port 3000
app.listen(3000, function () {
  console.log('Express app listening on port 3000');
});