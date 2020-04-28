const express = require("express"),
      path = require('path'),
      socketIO = require("socket.io"),
      port = process.env.PORT || 3000,
      sqlite3 = require('sqlite3').verbose(),
      INDEX = path.resolve(__dirname, "../public/index.html");

let messages = [];

const app = express()
  .use(express.static(path.resolve(__dirname, '../public')))
  .use((req, res) => res.sendFile(INDEX/*, { root: __dirname }*/));

const server = app.listen(port, () => console.log(`Listening on ${port}`));

const io = socketIO(server);

io.on('connection', (socket) => {
    console.log("a user connected :D");
    //retrieve all messages
    //if(messages.length === 0) {
    //  retrieveMessagesFromDatabase(function() {
    //    socket.emit('messagesUpdated', messages);
    //  });
    //} else {
      socket.emit('messagesUpdated', messages);
    //}
    //save message, and emit messagesUpdated
    socket.on('message', message => {
      if (message) {
        messages.push(message);
        io.sockets.emit('messagesUpdated', messages);
      }
    });
    socket.on('disconnect', () => {
      console.log('Client disconnected');
      if(Object.keys(io.sockets.connected).length === 0) {
        //if all users are dissconneced save data to the database
        //saveMessagesToDatabase();
      }
    });
});

function saveMessagesToDatabase() {
  let db = new sqlite3.Database("database", null, (err) => {
    console.error(err);
  });

  db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, message TEXT, author TEXT)");
   
    var stmt = db.prepare("INSERT INTO messages (message, author) VALUES (?, ?)");
    messages.forEach((message) => {
        stmt.run(message.message, message.author);
    });
    stmt.finalize();
  });
   
  db.close();
}

function retrieveMessagesFromDatabase(finishedCallBack) {
  let db = new sqlite3.Database("database", null, (err) => {
    console.error(err);
  });

  db.serialize(function() {
    db.each("SELECT * FROM messages", function(err, row) {
      messages.push({ message: row.message, author: row.author });
    });
  }, finishedCallBack());
   
  db.close();
}