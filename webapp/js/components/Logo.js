import React from 'react';
import MessageStore from './MessageStore';

class Logo extends React.Component{

    clearChat (event) {
        event.preventDefault();
        MessageStore.clearChat();
    }

    render() {
        return (
            <div className="header">
                <div className="Logo" />
                <input type="button" value="clearAll" onClick={this.clearChat} />
            </div>
        );
    }
}

module.exports = Logo;
