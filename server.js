var streamer = require('./lib/streamer')
  , express = require('express')
  , app = express.createServer()
  , http = require('http')
  , url = require('url')
  , fs = require('fs')
  , io = require('socket.io').listen(app);


/**
 * Express server
 */

app.use(express.favicon())
   .use(express.bodyParser())
   //.use(express.staticCache())
   .use(express['static'](__dirname + '/assets'))
   .use(app.router)
   .use(express.errorHandler({dumpExceptions: true}))
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
app.get('/record', function (req, res) {
  res.render('record.html');
});

// le random gif
app.get('/random', function (req, res) {
  var windows = require('./lib/windows')
    , keys = Object.keys(windows.storage)
    , random_key = _.random(0, keys.length);

  if (keys.length) {
    res.redirect('/v/' + keys[random_key]);
  } else {
    // TODO: better
    res.writeHead(404);
    res.end('There are no windows open at this moment!');
  }
});

// le window capture
app.post('/window/:id/capture', function (req, res) {
  streamer.capture(req, res);
});

// le view gif
app.get('/v/:id', function (req, res) {
  res.render('view.html');
});

// le streamed gif
app.get('/:id.gif', function (req, res) {
  streamer.stream(req.param('id'), req, res);
});

/**
 * General handlers
 */
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});


/**
 * Socket.io part
 */

var windows = {};

function broadcast(m) {
  if (m.window_id && windows[m.window_id]) {
    _(windows[m.window_id]).each(function (s) {
      if (s) {
        console.log("Sent!");
        s.emit("message", { msg: m.msg });
      }
    });
  }
}

io.sockets.on('connection', function (socket) {

  var window_id;

  socket.on("join", function (id) {
    console.log("Joining window", id);
    window_id = id;
    windows[id] = windows[id] || [];
    windows[id].push(socket);
    broadcast({ window_id: id, msg: "A visitor started watching", type: "join" });
  });

  socket.on("message", function (m) {
    console.log("Emitting", m);
    broadcast(m);
  });

  socket.on("disconnect", function () {
    delete(windows[window_id]);
    broadcast({ window_id: window_id, msg: "A visitor left", type: "part" });
  });

});



