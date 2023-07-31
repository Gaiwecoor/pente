/*************
**  CONFIG  **
*************/
const PORT = 3003;

/*******************************
**  NOT CONFIG - LEAVE ALONE  **
*******************************/
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const fs = require("fs");
const http = require("http");
const { Server: IOServer } = require("socket.io");
const { UMap } = require("./utils");

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.disable("x-powered-by");

//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Load Routers
const routers = fs.readdirSync(path.resolve(__dirname, "./routes"))
.filter(r => r.endsWith(".js"))
.map(f => f.slice(0, -3));

for (let route of routers) {
  const router = require(path.resolve(__dirname, "./routes", route));
  if (route == "root") route = "";
  app.use(`/${route}`, router);
}

// Default to Static
app.use(express.static(path.join(__dirname, 'public')));

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

const server = http.createServer(app);
const io = new IOServer(server);

app.set("port", PORT);
server.on("listening", () => {
  console.log("Listening on", PORT);
});
server.listen(PORT);

const { PenteGame, Player } = require("./penteClasses");

const games = new UMap();
const players = new UMap();
let playerCount = 0;


io.on("connection", (socket) => {
  const playerName = `Player ${++playerCount}`;
  socket.emit("ready", { id: socket.id, name: playerName });

  // Player Join
  socket.on("join", (room) => {
    if (!games.has(room)) games.set(room, new PenteGame({ id: room }));
    const game = games.get(room);

    if (game.players.length < 2) {
      const player = new Player({ name: playerName, id: socket.id });
      socket.join(room);
      game.addPlayer(player);
      players.set(socket.id, game);

      if (game.players.length > 1) {
        game.start();
        io.to(room).emit("gameUpdate", game);
      }
    }
  });

  // Player Placement
  socket.on("placeStone", ({ x, y }) => {
    const game = players.get(socket.id);
    if (game.currentId == socket.id) {
      const stone = game.place({ x: parseInt(x, 10), y: parseInt(y, 10) });
      io.to(game.id).emit("addStone", stone);
      for (const captured of game.capture(stone)) {
        io.to(game.id).emit("removeStone", captured, game.currentIndex);
      }

      if (game.checkSequence(stone) || (game.currentPlayer.captured.size >= 10))  {
        io.to(game.id).emit("victory", game.currentPlayer);
        game.currentIndex = null;
      } else {
        game.currentIndex = (game.currentIndex + 1) % game.players.length;
      }
      io.to(game.id).emit("newTurn", game.currentIndex);
    }
  });

  // Verify Game State
  socket.on("verifyState", () => {
    const game = players.get(socket.id);
    io.to(game.id).emit("gameUpdate", game);
  });

  // Player Leave
  socket.on("disconnecting", () => {
    players.delete(socket.id);
    if (players.size == 0) playerCount = 0;
    for (const room of socket.rooms) {
      if (games.has(room)) {
        const game = games.get(room);
        const index = game.players.findIndex(({ id }) => id == socket.id);
        const player = game.players[index];
        game.players = game.players.filter(p => p.id != socket.id);

        if (game.players.length == 0) {
          games.delete(room);
          return;
        } else if (game.currentPlayer > index) {
          game.currentPlayer--;
        }

        io.to(room).emit("gameUpdate", game);
      }
    }
  });
});

module.exports = {
  app,
  io,
  server,
};
