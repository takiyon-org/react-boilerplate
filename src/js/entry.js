import React from 'react';
import ReactDOM from 'react-dom';

import App from 'js/components/App';
import 'scss/app.scss';

// Fetch environment from window
const { APP_NAME } = window.env;

ReactDOM.render(<App name={APP_NAME} />, document.getElementById('mount'));
