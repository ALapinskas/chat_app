const express = require("express"),
      path = require('path'),
      socketIO = require("socket.io"),
      port = process.env.PORT || 3000,
      INDEX = path.resolve(__dirname, "../public/index.html");

const app = express()
  .use(express.static(path.resolve(__dirname, '../public')))
  .use((req, res) => res.sendFile(INDEX/*, { root: __dirname }*/));

const server = app.listen(port, () => console.log(`Listening on ${port}`));

const io = socketIO(server);

io.on('connection', (socket) => {
    console.log("a user connected :D");
    socket.on('disconnect', () => console.log('Client disconnected'));
});