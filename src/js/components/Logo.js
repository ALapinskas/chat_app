import React from 'react';
import { FormGroup, Classes, Dialog, Button } from "@blueprintjs/core";

class Logo extends React.Component{

    constructor(props){
        super();
        this.dataStore = props.store;
        const authorName = this.dataStore.getAuthorName();
        this.state = {
            authorName: authorName,
            inputName: authorName,
            isDialogOpen: false
        };
        this._updateInputName = this._updateInputName.bind(this);
        this._updateAuthorName = this._updateAuthorName.bind(this);
        this._showChangeNameDialog = this._showChangeNameDialog.bind(this);
        this._saveAndClose = this._saveAndClose.bind(this);
        this._cancelAndClose = this._cancelAndClose.bind(this);
        this._closeChangeNameDialog = this._closeChangeNameDialog.bind(this);
    }

    componentWillMount() {
        this.dataStore.on('author', this._updateAuthorName);
    }

    _updateInputName(inputName) {
        this.setState({inputName});
    }

    _updateAuthorName(authorName) {
        this.setState({authorName});
        this._updateInputName(authorName);
    }

    _showChangeNameDialog() {
        this.setState({ isDialogOpen: true });
    }

    _cancelAndClose() {
        this._updateAuthorName(this.state.authorName);
        this._closeChangeNameDialog();
    }

    _saveAndClose() {
        this.dataStore.setAuthorName(this.state.inputName);
        this._closeChangeNameDialog();
    }

    _closeChangeNameDialog() {
        this.setState({ isDialogOpen: false });
    }

    render() {
        return (
            <div className="header">
                <div className="Logo" />
                <FormGroup className="user-info">
                    <p>Вы вошли как: {this.state.authorName} </p>
                    <Button icon="edit" onClick={this._showChangeNameDialog} class="bp3-button" type="submit">Сменить ник</Button>
                </FormGroup>
                <Dialog title="Введите ваше имя" usePortal={true} canEscapeKeyClose={true} isCloseButtonShown={true} onClose={this._cancelAndClose} isOpen={this.state.isDialogOpen}>
                    <div className={Classes.DIALOG_BODY}>
                        <input className="shout_box bp3-input" value={this.state.inputName} onChange={(input) => this._updateInputName(input.target.value)} type="text"/>
                    </div>
                    <div className={Classes.DIALOG_FOOTER}>
                        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                            <Button onClick={this._cancelAndClose}>Отмена</Button>
                            <Button onClick={this._saveAndClose}>Сохранить</Button>
                        </div>
                    </div>
                </Dialog>
            </div>
        );
    }
}

module.exports = Logo;
