const express = require("express"),
      https = require('https'),
      fs = require('fs'),
      path = require('path'),
      socketIO = require("socket.io"),
      port = process.env.PORT || 3000,
      //sqlite3 = require('sqlite3').verbose(),
      //{ exec } = require('child_process'),
      pg = require('pg'),
      dotenv = require('dotenv'),
      INDEX = path.resolve(__dirname, "../public/index.html");

let messages = [], db;

dotenv.config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

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
    case 'sqlite':
      db = new sqlite3.Database("database", null, (err) => {
        console.error(err);
      });
    case 'mongo':
      //code for mongo
      //db = 
    case 'postrgress':
      /*db = new pg.Client({
        connectionString: process.env.DATABASE_URL,
        host: 'ec2-46-137-84-140.eu-west-1.compute.amazonaws.com',
        database: 'd7me8q5bctljau', // default process.env.PGDATABASE || process.env.USER
        port: 5432,
        user: 'hjpvdkqvhuucpl',
        password: '5bcaa8bfb4e3c1b11d4defd81b71cf9a79eff0dcf838b1871e2f464b888fd9de',
        //ssl: true,
      });*/

      return new Promise((resolve, reject) => {
        switch (process.env.NODE_ENV) {
          case "production":
            /*exec('heroku config:get DATABASE_URL -a chatapp-nn', (error, stdout, stderr) => {
              if (error) {
                console.error(`exec error: ${error}`);
                return;
              }*/
              //https.globalAgent.options.rejectUnauthorized = false;
              process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
              db = new pg.Client({
                connectionString: process.env.DATABASE_URL,
                //connectionString: "postgres://hjpvdkqvhuucpl:5bcaa8bfb4e3c1b11d4defd81b71cf9a79eff0dcf838b1871e2f464b888fd9de@ec2-46-137-84-140.eu-west-1.compute.amazonaws.com:5432/d7me8q5bctljau", //+ "?ssl=true&sslfactory=org.postgresql.ssl.NonValidatingFactory"//,
                ssl: true
              });
      
              console.log('connect db');
      
              db.connect()
                .then(() => {
                  resolve()
                })
                .catch((err) => {
                  console.error(err);
              });
            //});
          case "development":
            db = new pg.Client({
              connectionString: "postgresql://localhost"//,
              //ssl: true
            });
    
            console.log('connect db');
    
            db.connect()
              .then(() => {
                resolve()
              })
              .catch((err) => {
                console.error(err);
            });
        }
      })
      
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

  connectToDb().then(() => {
    db.query('SELECT * FROM messages;')
      .then((res) => {
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