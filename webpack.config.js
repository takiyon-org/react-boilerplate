import path from 'node:path';
import { fileURLToPath } from 'node:url';
import HtmlBundlerPlugin from 'html-bundler-webpack-plugin';
import webpack from 'webpack';

/* eslint-disable no-underscore-dangle */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const environment = process.env.NODE_ENV;
const isProduction = environment === 'production';

export default () => ({
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'eval',
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
        headers: {
            'Cache-Control': 'no-store',
        },
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
