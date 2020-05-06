'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import Logo from './components/Logo';
import Chat from './components/Chat';
import dotenv from 'dotenv';
dotenv.config()

let contact = (
    <div>
        <h1>
            <Logo /> Чат<br /> Нижнего Новгорода!
        </h1>
        <Chat />
    </div>
);

ReactDOM.render(
    contact,
    document.getElementById('app')
);
