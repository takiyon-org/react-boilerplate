const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const fs = require('node:fs');
const path = require('node:path');

function getEnvironmentParameters(stage) {
    let env = {};

    try {
        const data = fs.readFileSync(`public/env.${stage}.json`, 'utf8');
        env = JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // eslint-disable-next-line no-console
            console.log(`Environment file not found for stage '${stage}'. Skipping.`);
        } else {
            throw error;
        }
    }

    return `<script>window.env = ${JSON.stringify(env)};</script>`;
}

module.exports = ({ stage = 'local' }) => ({
    mode: stage === 'prod' ? 'production' : 'development',
    entry: {
        app: './src/js/entry.jsx',
    },
    output: {
        path: path.join(__dirname, '/public'),
        filename: stage === 'prod' ? 'assets/js/[name]-[contenthash].js' : 'assets/js/[name].js',
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
                    MiniCssExtractPlugin.loader,
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
        hints: stage === 'prod' ? 'warning' : false,
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: stage === 'prod' ? 'assets/css/[name]-[contenthash].css' : 'assets/css/[name].css',
        }),
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            filename: 'index.html',
            inject: false,
            minify: false,
            templateParameters: {
                env: getEnvironmentParameters(stage),
            },
        }),
    ],
});
