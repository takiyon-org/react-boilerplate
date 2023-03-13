import PropTypes from 'prop-types';
import React from 'react';

const propTypes = {
    name: PropTypes.string.isRequired,
};

function App({ name }) {
    return <h1>{`Hello, ${name}!`}</h1>;
}

App.propTypes = propTypes;

export default App;
