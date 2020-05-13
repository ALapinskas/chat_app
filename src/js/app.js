'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import Header from './components/Header';
import Chat from './components/Chat';
import DataBus from './components/DataBus';
import css from '../scss/styles.scss';
import dotenv from 'dotenv';
import io from 'socket.io-client';
dotenv.config()

let dataBus = new DataBus({io});

let contact = (
    <div>
        <Header dataBus={dataBus} /> 
        <h1>Чат</h1>
        <Chat dataBus={dataBus} />
    </div>
);

ReactDOM.render(
    contact,
    document.getElementById('app')
);
