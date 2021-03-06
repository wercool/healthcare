var express = require('express');
var https = require('https');
var fs = require('fs');
var app = express();

var sslOptions = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
  passphrase: 'q1w2e3r4t5'
};


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
  res.locals.error = err;
  if (err.status >= 100 && err.status < 600)
    res.status(err.status);
  else
    res.status(500);
});

// listen on port 3000
// app.listen(3000, function () {
//   console.log('Express app listening on port 3000');
// });

https.createServer(sslOptions, app).listen(8443, function () {
  console.log('Express app listening on port 8443');
});