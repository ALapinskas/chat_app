import React from 'react';

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

        this.props.onSend(this.state.input);

        this.setState({
            input: ''
        });
    }

    updateInput(event) {
        this.setState({ input: event.target.value });
    }

    render () {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    <input className="shout_box" value={this.state.input} onChange={this.updateInput} type="text" placeholder="Write your message here" />
                </label>
                <input type="submit" value="Submit" />
            </form>
        );
    }

}

class ChatMessage extends React.Component {
    render() {
        return <p>{this.props.message}</p>;
    }
}

class ChatList extends React.Component {
    render() {
        var messages = this.props.messages.map(function(msg) {
            return <ChatMessage message={msg} />;
        });

        return <div>{messages}</div>;
    }
}

module.exports = {
    ChatBox,
    ChatList,
    ChatMessage
}
