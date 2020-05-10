//This is just imitation
var EventEmitter = require('events').EventEmitter;

var messages = [], author, gender;

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
            this.emit("authorChanged", name);
        }
    }

    setAuthorGender (newGender) {
        let oldGender = gender;
        if (newGender !== oldGender) {
            gender = newGender;
            this.emit("genderChanged", gender);
            let currentClassList = document.body.classList;
            if (oldGender && currentClassList.contains(oldGender)) {
                currentClassList.remove(oldGender);
            }
            if (newGender && !currentClassList.contains(newGender)) {
                currentClassList.add(newGender)
            }
        }
    }

    getAuthorGender() {
        return gender;
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
