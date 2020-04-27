var React = require('react');
var updateTheMessages;
var io = require('socket.io-client');

import { ChatList, ChatBox } from './ChatBox';
import MessageStore from './MessageStore';

class Chat extends React.Component{

    constructor(props) {
        super();
        let enterName =  prompt('Please enter your name');
        let getLastMessages = MessageStore.getMessages();
        this.state = {
            messages: getLastMessages,
            author: enterName
        };
        this.socket = undefined;

        //this.updateMessages = this.updateMessages.bind(this);
    }

    componentWillMount() {
        //MessageStore.subscribe(this.updateMessages);
        //updateTheMessages = setInterval(() => this.updateMessages(), 1000);
    }

    componentWillUnmount() {
        //MessageStore.unsubscribe(this.updateMessages);
        //clearInterval(updateTheMessages);
        this.socket.removeAllListeners();
        this.socket = undefined;
    }

    componentDidMount() {
        this.socket = io();
        this.socket.on('messagesUpdated', (messages) => {
            this.setState({messages});
        });
    }

    //updateMessages() {
    //    this.setState({
    //        messages: MessageStore.getMessages()
    //    });
    //}

    onSend(message) {
        this.socket.emit('message', {message, author: this.state.author});
        //MessageStore.newMessage(newMessage, this.state.author);
    }

    render() {
        return (
            <div>
                <ChatList messages={this.state.messages || []} />
                <ChatBox onSend={(newMessage) => this.onSend(newMessage)} />
            </div>
        );
    }
}

module.exports = Chat;
