'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import Logo from './components/Logo';
import Chat from './components/Chat';
import DataStore from './components/DataStore';
import css from '../scss/styles.scss';
import dotenv from 'dotenv';
dotenv.config()

let store = new DataStore();

let contact = (
    <div>
        <Logo store={store} /> 
        <h1>Чат<br /> Нижнего Новгорода! </h1>
        <Chat store={store} />
    </div>
);

ReactDOM.render(
    contact,
    document.getElementById('app')
);
