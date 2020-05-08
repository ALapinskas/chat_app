var React = require('react');
var updateTheMessages;
var io = require('socket.io-client');

import { ChatList, ChatBox } from './ChatBox';

class Chat extends React.Component{

    constructor(props) {
        super();
        let enterName =  prompt('Please enter your name');

        this.dataStore = props.store;

        if (enterName) {
            this.dataStore.setAuthorName(enterName);
        }
        this.state = {
            messages: this.dataStore.getMessages(),
            author: enterName
        };
        this.socket = undefined;

        this._updateAuthorName = this._updateAuthorName.bind(this);
    }

    componentWillMount() {
        //DataStore.subscribe(this.updateMessages);
        //updateTheMessages = setInterval(() => this.updateMessages(), 1000);
        this.dataStore.on('author', this._updateAuthorName);
    }

    componentWillUnmount() {
        this.socket.removeAllListeners();
        this.socket = undefined;
    }

    componentDidMount() {
        this.socket = io();
        this.socket.on('messagesUpdated', (messages) => {
            this.setState({messages});
        });
    }

    _updateAuthorName(author) {
        this.setState({author});
    }

    onSend(message) {
        this.socket.emit('message', {message, author: this.state.author});
    }

    render() {
        return (
            <div>
                <ChatBox onSend={(newMessage) => this.onSend(newMessage)} />
                <ChatList messages={this.state.messages || []} />
            </div>
        );
    }
}

module.exports = Chat;