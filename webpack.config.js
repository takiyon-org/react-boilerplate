import path from 'node:path';
import HtmlBundlerPlugin from 'html-bundler-webpack-plugin';
import webpack from 'webpack';

const { dirname } = import.meta;
const environment = process.env.NODE_ENV;
const isProduction = environment === 'production';

export default () => ({
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'eval',
    output: {
        path: path.join(dirname, '/public'),
        publicPath: '/',
    },
    resolve: {
        modules: [
            path.join(dirname, '/node_modules'),
            path.join(dirname, '/src'),
        ],
        extensions: ['.js', '.ts', '.tsx'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
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
