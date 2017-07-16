import { merge } from 'lodash';

class RequestError extends Error {
    constructor(message) {
        super(message);

        this.message = message.message;
        this.response = message.response;
    }

    toString() {
        return this.message;
    }
}

function queryString(params) {
    if (params === undefined || params === null) {
        return '';
    }

    if (Object.keys(params).length === 0) {
        return '';
    }

    const query = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');

    return `?${query}`;
}

// Base options that can be overridden
const baseOptions = {
    // Always expect JSON response
    headers: {
        Accept: 'application/json',
    },
};

function fetchRequest(url, options, overrides) {
    return fetch(
        `${url}${queryString(options.params)}`,
        merge({}, baseOptions, options, overrides),
    ).then((response) => {
        if (response.ok) {
            return response.json();
        }

        throw new RequestError({
            message: 'Network response was not OK.',
            response,
        });
    });
}

/**
 * Simple wrapper around the fetch API to make calls in the application easier.
 *
 * @param {string} url
 * @param {object} options
 *
 * @returns {Promise}
 */
function request(url, options = {}) {
    // Always-enabled options
    const overrides = { headers: {} };

    // Automatically set headers to expect JSON transmissions
    if (options.body !== undefined) {
        overrides.headers['Content-Type'] = 'application/json';
        overrides.body = JSON.stringify(options.body);
    }

    return fetchRequest(url, options, overrides);
}

export {
    request as default,
    baseOptions,
};
