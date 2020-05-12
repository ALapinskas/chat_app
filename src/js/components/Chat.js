import React from 'react';

import { ChatList, ChatBox } from './ChatBox';

class Chat extends React.Component{

    constructor(props) {
        super();

        this.dataBus = props.dataBus;

        this.state = {
            messages: this.dataBus.getMessages(),
            author: this.dataBus.getAuthorName()
        };

        this._updateAuthorName = this._updateAuthorName.bind(this);
    }

    componentWillMount() {
        this.dataBus.on('authorChanged', this._updateAuthorName);
        this.dataBus.showChangeAuthorDialog();
    }

    componentWillUnmount() {
        this.dataBus.removeAllListeners();
        this.dataBus = undefined;
    }

    componentDidMount() {
        this.dataBus.on('gotMessagesUpdates', (messages) => {
            this.setState({messages});
        });
    }

    _updateAuthorName(author) {
        this.setState({author});
    }

    onSend(message) {
        this.dataBus.writeMessage(message);
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
