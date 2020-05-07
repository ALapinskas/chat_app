import React from 'react';
import { FormGroup, Classes, Dialog } from "@blueprintjs/core";

class Logo extends React.Component{

    constructor(props){
        super();
        this.dataStore = props.store;
        this.state = {
            authorname: this.dataStore.getAuthorName(),
            isDialogOpen: false
        };
        this._updateAuthorName = this._updateAuthorName.bind(this)
    }

    componentWillMount() {
        this.dataStore.on('author', this._updateAuthorName);
        //this.setState({authorname: this.dataStore.getAuthorName()});
    }

    _updateAuthorName(authorname) {
        this.setState({authorname});
    }

    _showChangeNameDialog() {
        this.setState({ isDialogOpen: true });
    }

    render() {
        return (
            <div className="header">
                <div className="Logo" />
                <FormGroup className="user-info">
                    <p>Вы вошли как: {this.state.authorname} </p>
                    <input onClick={() => this._showChangeNameDialog()} class="bp3-button" type="submit" value="Сменить ник" />
                </FormGroup>
                <Dialog icon="info-sign" canEscapeKeyClose={true} isCloseButtonShown={true} isOpen={this.state.isDialogOpen}>
                    <FormGroup className={Classes.DIALOG_BODY}>
                        <input className="shout_box bp3-input" value={this.state.authorname} onChange={(input) => this._updateAuthorName(input.target.value)} type="text"/>
                        <input class="bp3-button" type="submit" value="Сохранить" />
                    </FormGroup>
                </Dialog>
            </div>
        );
    }
}

module.exports = Logo;
