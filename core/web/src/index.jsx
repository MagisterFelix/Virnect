import * as process from 'process';

import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

import './index.scss';

window.global = window;
window.process = process;
window.Buffer = [];

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
