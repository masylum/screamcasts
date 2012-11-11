var streamer = require('./lib/streamer')
  , express = require('express')
  , app = express.createServer()
  , http = require('http')
  , url = require('url')
  , fs = require('fs');

app.use(express.favicon())
   .use(express.staticCache())
   .use(express['static'](__dirname + '/assets'))
   .use(express.bodyParser())
   .use(app.router)
   .use(express.errorHandler())
   ;

app.set('view options', {layout: false});
app.register('.html', {compile: function (str, _) {
  return function (_) {
    return str;
  };
}});

app.listen(3000);

// le home
app.get('/', function (req, res) {
  res.render('home.html');
});

// le webcam
app.get('/view', function (req, res) {
  res.render('view.html');
});

// le random gif
app.get('/random', function (req, res) {
});

// le post
app.post('/capture', function (req, res) {
  streamer.capture(req, res);
});

// le streamed gif
app.get('/window/:id.gif', function (req, res) {
  streamer.stream(req.param('id'), req, res);
});
