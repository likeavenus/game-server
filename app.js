require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http");
const port = process.env.PORT ?? 3000;
const cors = require("cors");
const index = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(index, {
  cors: {
    origin: "*",
  },
});
app.use(cors());

app.use(express.static("public"));

const players = {};

io.on("connection", (socket) => {
  console.log("a user connected: ", socket.id);
  players[socket.id] = {
    x: Math.floor(Math.random() * 800),
    y: Math.floor(Math.random() * 600),
    id: socket.id,
  };

  socket.broadcast.emit("new_player", players[socket.id]);

  socket.on("move", (mouseCoords) => {
    if (mouseCoords.id) {
      players[mouseCoords.id].x = mouseCoords.x;
      players[mouseCoords.id].y = mouseCoords.y;
      socket.broadcast.emit("move", players);
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    // remove this player from our players object
    delete players[socket.id];

    io.emit("remove_player", socket.id);
  });
});

app.use(function (request, response) {
  response.send("<h2>Hello</h2>");
});

index.listen(process.env.PORT || 8080, () => {
  console.log(`listening on *:${process.env.PORT}`);
});
