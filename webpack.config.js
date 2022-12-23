const path = require('path');

module.exports = {
    entry: {
        app: './src/js/entry.js',
    },
    output: {
        path: path.join(__dirname, '/public/assets/js'),
    },
    resolve: {
        modules: [
            path.join(__dirname, '/node_modules'),
            path.join(__dirname, '/src'),
        ],
    },
    module: {
        rules: [
            {
                test: /\.js?$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
            },
        ],
    },
};
