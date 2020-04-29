const express = require("express"),
      path = require('path'),
      socketIO = require("socket.io"),
      port = process.env.PORT || 3000,
      sqlite3 = require('sqlite3').verbose(),
      pg = require('pg'),
      dotenv = require('dotenv').config(),
      INDEX = path.resolve(__dirname, "../public/index.html");

let messages = [], db;

const app = express()
  .use(express.static(path.resolve(__dirname, '../public')))
  .use((req, res) => res.sendFile(INDEX/*, { root: __dirname }*/));

const server = app.listen(port, () => console.log(`Listening on ${port}`));

const io = socketIO(server);

io.on('connection', (socket) => {
    console.log("a user connected :D");
    //retrieve all messages
    if(messages.length === 0) {
      retrieveMessagesFromDatabase(function() {
        socket.emit('messagesUpdated', messages);
      });
    } else {
      socket.emit('messagesUpdated', messages);
    }
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
        saveMessagesToDatabase();
      }
    });
});

function connectToDb() {
  switch (process.env.NODE_DB) {
    case 'sqllite':
      db = new sqlite3.Database("database", null, (err) => {
        console.error(err);
      });
    case 'mongo':
      //code for mongo
      //db = 
    case 'postrgress':
      db = new pg.Client({
        connectionString: process.env.DATABASE_URL,
        ssl: true,
      });

      db.connect();
  }
}

function retrieveMessagesFromDatabase(callback) {
  switch (process.env.NODE_DB) {
    case 'sqllite':
      retrieveMessagesFromDatabaseSqllite(callback);
    case 'mongo':
      retrieveMessagesFromDatabaseMongo(callback);
    case 'postrgress':
        retrieveMessagesFromDatabasePostgress(callback);
  }
}

function saveMessagesToDatabase() {
  switch (process.env.NODE_DB) {
    case 'sqllite':
      saveMessagesToDatabaseSqllite();
    case 'mongo':
      saveMessagesToDatabaseMongo();
    case 'postrgress':
      saveMessagesToDatabasePostrgress();
  }
}

function saveMessagesToDatabaseSqllite() {

  connectToDb();

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

function retrieveMessagesFromDatabaseSqllite(finishedCallBack) {

  connectToDb();

  db.serialize(function() {
    db.each("SELECT * FROM messages", function(err, row) {
      messages.push({ message: row.message, author: row.author });
    });
  }, finishedCallBack());
   
  db.close();

}

function retrieveMessagesFromDatabaseMongo(finishedCallBack) {

}

function saveMessagesToDatabaseMongo() {

}

function retrieveMessagesFromDatabasePostgress(finishedCallBack) {

  connectToDb();

  db.query('SELECT * FROM messages;', (err, res) => {
    if (err) throw err;
    for (let row of res.rows) {
      messages.push({ message: row.message, author: row.author });
    }
    db.end();
    finishedCallBack();
  });

}

function saveMessagesToDatabasePostrgress() {

  connectToDb();

  db.query("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, message TEXT, author TEXT);");
  messages.forEach((message) => {
    db.query("INSERT INTO messages (message, author) VALUES ($1, $2)", [message.message, message.author]);
  });
  db.end(); 
  
}