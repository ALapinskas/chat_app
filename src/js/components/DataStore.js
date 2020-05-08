//This is just imitation
var EventEmitter = require('events').EventEmitter;

var messages = [], author;

class DataStore extends EventEmitter {
    showChangeAuthorDialog() {
        this.emit("showChangeAuthorDialog");
    }

    getAuthorName () {
        return author ? author : "";
    }

    setAuthorName (name) {
        if (name && name.length > 0) {
            author = name;
            this.emit("author", name);
        }
    }

    getMessages () {
       return messages;
    }

    newMessage (message, author) {
        //messages.push({message, author});
        //socket.on('connect', function(){});
        socket.emit('message', {message, author});
        //emitter.emit('update');
    }
}

module.exports = DataStore;
