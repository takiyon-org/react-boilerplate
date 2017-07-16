import React from 'react';
import ReactDOM from 'react-dom';

import App from 'js/components/App';
import request from 'js/utils/request';

// Load environment configuration
request('env.json').then((env) => {
    ReactDOM.render(<App name={env.APP_NAME} />, document.getElementById('mount'));
});
