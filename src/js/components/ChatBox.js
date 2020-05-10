import React from 'react';
import { Button, ControlGroup } from "@blueprintjs/core";

class ChatBox extends React.Component {

    constructor(props) {
        super();
        this.state = {
          input: ''
        };

        this.updateInput = this.updateInput.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();

        if (this.state.input.trim().length > 0) {
            this.props.onSend(this.state.input);

            this.setState({
                input: ''
            });
        }
    }

    updateInput(event) {
        this.setState({ input: event.target.value });
    }

    render () {
        return (
            <form onSubmit={this.handleSubmit}>
                <ControlGroup fill={true} vertical={false}>
                    <input className="shout_box messageInput bp3-input" value={this.state.input} onChange={this.updateInput} type="text" placeholder="Сообщение" />
                    <Button class="bp3-button"  icon="comment" type="submit">Отправить</Button>
                </ControlGroup>
            </form>
        );
    }

}

class ChatMessage extends React.Component {
    render() {
        return <p>{this.props.messageObj.author}: {this.props.messageObj.message}</p>;
    }
}

class ChatList extends React.Component {
    render() {
        var messages = this.props.messages.reverse().map(function(msg) {
            return <ChatMessage messageObj={msg} />;
        });

        return <div>{messages}</div>;
    }
}

module.exports = {
    ChatBox,
    ChatList,
    ChatMessage
}
