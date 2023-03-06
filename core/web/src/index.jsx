import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

import './index.scss';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(process.env.NODE_ENV === 'development' ? <React.StrictMode><App /></React.StrictMode> : <App />);
