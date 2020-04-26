var React = require('react');
var updateTheMessages;

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

        this.updateMessages = this.updateMessages.bind(this);
    }

    componentWillMount() {
        MessageStore.subscribe(this.updateMessages);
        //updateTheMessages = setInterval(() => this.updateMessages(), 1000);
    }

    componentWillUnmount() {
        MessageStore.unsubscribe(this.updateMessages);
        //clearInterval(updateTheMessages);
    }

    updateMessages() {
        this.setState({
            messages: MessageStore.getMessages()
        });
    }

    onSend(newMessage) {
        MessageStore.newMessage(newMessage, this.state.author);
    }

    render() {
        return (
            <div>
                <ChatList messages={this.state.messages || []} />
                <ChatBox onSend={() => this.onSend()} />
            </div>
        );
    }
}

module.exports = Chat;
