const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const path = require('node:path');
const webpack = require('webpack');

const environment = process.env.NODE_ENV;
const isProduction = environment === 'production';

module.exports = () => ({
    mode: isProduction ? 'production' : 'development',
    output: {
        path: path.join(__dirname, '/public'),
        publicPath: '/',
    },
    resolve: {
        modules: [
            path.join(__dirname, '/node_modules'),
            path.join(__dirname, '/src'),
        ],
        extensions: ['.js', '.jsx'],
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    'css-loader',
                    'sass-loader',
                ],
            },
        ],
    },
    devServer: {
        open: true,
        watchFiles: ['src/**/*'],
    },
    performance: {
        hints: isProduction ? 'warning' : false,
    },
    plugins: [
        new webpack.DefinePlugin({
            APP_NAME: JSON.stringify('React Boilerplate'),
        }),
        new HtmlBundlerPlugin({
            extractComments: true,
            entry: {
                index: 'src/index.html',
            },
            js: {
                filename: isProduction ? 'assets/js/app-[contenthash].js' : 'assets/js/app.js',
            },
            css: {
                filename: isProduction ? 'assets/css/[name]-[contenthash].css' : 'assets/css/[name].css',
            },
        }),
    ],
});
