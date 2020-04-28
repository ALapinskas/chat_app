//This is just imitation
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();

var messages = [];

module.exports = {
    getMessages: function() {
       return messages;
    },

    subscribe: function(callback) {
        emitter.addListener('update', callback);
    },

    unsubscribe: function(callback) {
        emitter.removeListener('update', callback);
    },

    newMessage: function(message, author) {
        //messages.push({message, author});
        //socket.on('connect', function(){});
        socket.emit('message', {message, author});
        //emitter.emit('update');
    }
};
