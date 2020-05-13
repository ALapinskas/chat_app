import React from 'react';
import { FormGroup, Classes, Dialog, Button, RadioGroup, Radio, Alert, Tooltip, Spinner } from "@blueprintjs/core";

class Header extends React.Component{

    constructor(props){
        super();
        this.dataBus = props.dataBus;
        const authorName = this.dataBus.getAuthorName();
        this.state = {
            authorName: authorName,
            gender: this.dataBus.getAuthorGender(),
            inputName: authorName,
            isDialogOpen: false,
            firstTimeOpen: false,
            emptyNameError: false,
            alertMessage: "",
            showAlert: false,
            usersOnline: 0
        };
        this._updateInputName = this._updateInputName.bind(this);
        this._updateAuthorName = this._updateAuthorName.bind(this);
        this._showChangeNameDialog = this._showChangeNameDialog.bind(this);
        this._saveAndClose = this._saveAndClose.bind(this);
        this._cancelAndClose = this._cancelAndClose.bind(this);
        this._closeChangeNameDialog = this._closeChangeNameDialog.bind(this);
        this._handleErrorClose = this._handleErrorClose.bind(this);
    }

    componentWillMount() {
        this.dataBus.on('authorChanged', this._updateAuthorName);
        this.dataBus.on("showChangeAuthorDialog", () => this._showChangeNameDialog(true));
        this.dataBus.on("gotUsersOnlineUpdates", (usersOnline) => this._updateUsersOnlineCounter(usersOnline));
    }

    componentWillUnmount() {
        this.dataBus.removeAllListeners();
    }

    _updateInputName(inputName) {
        this.setState({inputName});
    }

    _updateAuthorName(authorName) {
        this.setState({authorName});
        this._updateInputName(authorName);
    }

    _updateUsersOnlineCounter(usersOnline) {
        this.setState({usersOnline});
    }

    _showChangeNameDialog(firstTimeOpen = false) {
        this.setState({ isDialogOpen: true, firstTimeOpen });
        setTimeout(() => {
            let nameInput = document.getElementsByClassName('nameInput');
            if(nameInput && nameInput.length > 0) {
                nameInput[0].focus();
                nameInput[0].select();
            }
        });
    }

    _handleGenderChange(gender) {
        this.setState({gender});
        this.dataBus.setAuthorGender(gender);
    }

    _cancelAndClose() {
        this._updateAuthorName(this.state.authorName);
        this._closeChangeNameDialog();
    }

    _saveAndClose(e) {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        if (this.state.inputName && this.state.inputName.trim().length > 0) {
            this.dataBus.setAuthorName(this.state.inputName);
            this._closeChangeNameDialog();
        } else {
            this.setState({emptyNameError: true});
        }
    }

    _closeChangeNameDialog() {
        this.setState({ isDialogOpen: false });
        setTimeout(() => {
            let messageInput = document.getElementsByClassName("messageInput");
            if (messageInput) {
                messageInput[0].focus();
                messageInput[0].select();
            }
        })
    }

    _handleErrorClose() {
        this.setState({emptyNameError: false});
    }

    _handleAlertClose() {
        this.setState({showAlert: false});
    }

    _callForSoul() {
        let tryToCall = Math.floor(Math.random() * 10);  
        if (tryToCall > 5) {
            this.setState({showAlert: true, alertMessage: "Вам повезло ваша половинка нашлась, скажите что-нибудь!"});
            this.dataBus.callForSoul();
        } else {
            this.setState({showAlert: true, alertMessage: "К сожалению поиски не увенчались успехом, попробуйте еще раз!"});
        }
        
    }

    render() {
        return (
            <div className="header">
                <Alert
                    confirmButtonText="Закрыть"
                    isOpen={this.state.showAlert}
                    onClose={() => this._handleAlertClose()}
                >
                    <p>
                        {this.state.alertMessage}
                    </p>
                </Alert>
                <div className="Logo" />
                <FormGroup className="user-info">
                    <p>Вы вошли как: {this.state.authorName} </p>
                    <Button icon="edit" onClick={() => this._showChangeNameDialog()} class="bp3-button" type="submit">Сменить ник</Button>

                    {this.state.usersOnline === 1 ? <p>Вы один в чате<br />{<Tooltip content="Вы можете попробовать позвать вашу потерянную половинку"><Button onClick={() => this._callForSoul()}>Позвать</Button></Tooltip>}</p>
                    : <p>Пользователей он-лайн: {this.state.usersOnline}</p>}

                </FormGroup>
                <Dialog title="Введите ваше имя и пол" usePortal={true} canOutsideClickClose={!this.state.firstTimeOpen} canEscapeKeyClose={!this.state.firstTimeOpen} isCloseButtonShown={!this.state.firstTimeOpen} onClose={this._closeChangeNameDialog} isOpen={this.state.isDialogOpen}>
                    <form  onSubmit={this._saveAndClose}>
                        <div className={Classes.DIALOG_BODY}>
                            <RadioGroup
                                label="Кто вы?"
                                onChange={(input) => this._handleGenderChange(input.target.value)}
                                selectedValue={this.state.gender}
                            >
                                <Radio label="Парень" value="male" />
                                <Radio label="Девушка" value="female" />
                            </RadioGroup>
                            <label >Ваше Имя:</label>
                            <input className="shout_box nameInput bp3-input" value={this.state.inputName} onChange={(input) => this._updateInputName(input.target.value)} type="text"/>
                            <Alert
                                confirmButtonText="Закрыть"
                                isOpen={this.state.emptyNameError}
                                onClose={this._handleErrorClose}
                            >
                                <p>
                                    Имя не может быть пустым!
                                </p>
                            </Alert>
                        </div>
                        <div className={Classes.DIALOG_FOOTER}>
                            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                                <Button disabled={this.state.firstTimeOpen} onClick={this._cancelAndClose}>Отмена</Button>
                                <Button onClick={this._saveAndClose}>Сохранить</Button>
                            </div>
                        </div>
                    </form>
                </Dialog>
            </div>
        );
    }
}

module.exports = Header;
