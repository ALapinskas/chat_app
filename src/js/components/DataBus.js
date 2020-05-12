//This is just imitation
import { EventEmitter } from 'events';

var messages = [], author, gender = "male";

class DataBus extends EventEmitter {
    constructor(props) {
        super();
        this._socket = props.io();
        this.registerListeners()
    }

    registerListeners() {
        this.connection.on('messagesUpdated', (newMessages) => this._updateMessages(newMessages) );
        this.connection.on('usersConnected', (usersOnline) => this._updateUsersOnline(usersOnline) );
    }

    get connection () {
        return this._socket;
    }

    _updateMessages(newMessages) {
        if (JSON.stringify(messages) !== JSON.stringify(newMessages) ) {
            messages = newMessages;
            this.emit('gotMessagesUpdates', messages);
        }
    }

    _updateUsersOnline(usersOnline) {
        this.emit('gotUsersOnlineUpdates', usersOnline);
    }

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

    writeMessage(message) {
        this.connection.emit('message', {message, author, gender});
    }

    callForSoul() {
        this.connection.emit('callForSoul');
    }
}

module.exports = DataBus;
