const express = require("express"),
      https = require('https'),
      fs = require('fs'),
      path = require('path'),
      socketIO = require("socket.io"),
      port = process.env.PORT || 3000,
      { Pool, Client } = require('pg'),
      dotenv = require('dotenv'),
      INDEX = path.resolve(__dirname, "../public/index.html");

let messages = [], db, sqlite3;

dotenv.config();

if(process.env.NODE_ENV === "development") {
  sqlite3 = require('sqlite3').verbose();
}

const app = express()
  .use(express.static(path.resolve(__dirname, '../public')));

app.get('/', (req, res) => res.sendFile(INDEX));
const server = app.listen(port, () => console.log(`Listening on ${port}`));

//const options = {
//  key: fs.readFileSync('key.pem', 'utf8'),
//  cert: fs.readFileSync('cert.pem', 'utf8'),
//  passphrase: process.env.HTTPS_PASSPHRASE || '1234a', 
//  rejectUnauthorized: false
//};

//const server = https.createServer(options, app).listen(port, () => console.log(`Listening https on ${port}`));

const io = socketIO(server);

io.on('connection', (socket) => {
    //console.log("a user connected :D");
    let usersOnline = Object.keys(io.sockets.connected).length;

    socket.emit('usersConnected', usersOnline);
    
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
      //console.log('Client disconnected');

      usersOnline = Object.keys(io.sockets.connected).length;
      socket.emit('usersConnected', usersOnline);
      
      if(usersOnline === 0) {
        //if all users are dissconneced save data to the database
        saveMessagesToDatabase();
      }
    });

    socket.on('callForSoul', () => {
      usersOnline = Object.keys(io.sockets.connected).length + 1;
      socket.emit('usersConnected', usersOnline);
    });
});

function connectToDb() {
  console.log('connect to db');
  console.log(process.env.NODE_DB);
  switch (process.env.NODE_DB) {
    case 'sqlite':
      return new Promise((resolve, reject) => {
        db = new sqlite3.Database("database", null, (err) => {
          if(err) {
            console.error(err);
          }
          resolve();
        });
      });
    case 'mongo':
      //code for mongo
      //db = 
    case 'postrgress':
      return new Promise((resolve, reject) => {
        switch (process.env.NODE_ENV) {
          case "production":
              console.log('connect to db');
              console.log(process.env.DATABASE_URL);
              db = new Client({
                connectionString: process.env.DATABASE_URL,
                ssl: {
                  rejectUnauthorized: false
                }
              });
      
              db.connect()
                .then(() => {
                  resolve()
                })
                .catch((err) => {
                  console.error(err);
              });
            break;
          case "development":
            db = new Client({
              connectionString: "postgresql://localhost"
            });
    
            db.connect()
              .then(() => {
                resolve()
              })
              .catch((err) => {
                console.error(err);
            });
            break;
        }
      });
  }
}

function retrieveMessagesFromDatabase(callback) {
  switch (process.env.NODE_DB) {
    case 'sqlite':
      retrieveMessagesFromDatabaseSqllite(callback);
    case 'mongo':
      retrieveMessagesFromDatabaseMongo(callback);
    case 'postrgress':
      retrieveMessagesFromDatabasePostgress(callback);
  }
}

function saveMessagesToDatabase() {
  switch (process.env.NODE_DB) {
    case 'sqlite':
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
      if(row && row.message) {
        messages.push({ message: row.message, author: row.author });
      }
    });
  }, finishedCallBack());
   
  db.close();

}

function retrieveMessagesFromDatabaseMongo(finishedCallBack) {

}

function saveMessagesToDatabaseMongo() {

}

function retrieveMessagesFromDatabasePostgress(finishedCallBack) {

  connectToDb().then(() => {
    //console.log('start to retrieving messages');
    db.query('SELECT * FROM messages;')
      .then((res) => {
        //console.log(res.rows);
        for (let row of res.rows) {
          messages.push({ message: row.message, author: row.author, id: row.id});
        }
        Promise.resolve();
      })
      .then(() => {
        db.end();
        finishedCallBack();
      })
      .catch((err) => {
        if (err) {
          if (err.code === "42P01" && err.message === 'relation "messages" does not exist') {
            db.end();
            return;
          } else {
            throw err;
          }
        }
      });
  });

}

function saveMessagesToDatabasePostrgress() {

  connectToDb()
    .then(() => db.query("CREATE TABLE IF NOT EXISTS messages (id SERIAL PRIMARY KEY, message text, author text, timestamp timestamp default current_timestamp);"))
    .then(() => {
      //console.log('started to save messages to db');
      let preparedPromisesQueres = [];
      messages.forEach((message) => {
        if (!message.hasOwnProperty('id')) {
          preparedPromisesQueres.push(db.query("INSERT INTO messages (message, author) VALUES ($1, $2)", [message.message, message.author]));
        }
      });
      return Promise.all(preparedPromisesQueres);
    })
    .then(() => db.end())
    .catch((err) => {
      console.log(err);
    });
}