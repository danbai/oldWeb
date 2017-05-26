var webpack = require('webpack');
var path = require('path');
var uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var CopyWebpackPlugin = require('copy-webpack-plugin');
// var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js');
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

const vendors = [
    'babel-polyfill',
    "intl",
    'antd',
    'echarts',
    'echarts/lib/chart/pie',
    'echarts/lib/component/tooltip',
    'echarts/lib/component/title',
    'echarts/lib//component/legend',
    'echarts/lib/chart/line',
    'echarts/lib//component/grid',
    'react',
    'react-cookie',
    'react-dom',
    'react-router',
    'react-intl',
    'react-redux',
    'redux',
    'redux-thunk',
    'underscore'
];

module.exports = {
    devtool: 'source-map',
    entry: {
        main: [
            path.resolve(__dirname, 'app/_window.js'),
            path.resolve(__dirname, 'app/main.jsx')
        ],
        vendor: vendors
    },
    output: {
        path: __dirname + '/build',
        publicPath: '/',
        filename: './[name].js'
    },
    module: {
        loaders: [
            { test: /\.css$/, include: path.resolve(__dirname, 'app'), loader: ExtractTextPlugin.extract("style-loader", "css-loader") },
            { test: /\.less$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader") },
            { test: /\.js[x]?$/, include: path.resolve(__dirname, 'app'), exclude: /node_modules/, loader: 'babel-loader' },
            { test: /\.(png|jpg|gif)$/, loader: 'url-loader?limit=8192' },
            { test: /\.json$/, loader: 'json' }
        ]
    },
    postcss: function () {
        return [require('autoprefixer'), require('precss')];
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.css', '.less', '.json'],
    },
    plugins: [
        new webpack.optimize.DedupePlugin(),
        new uglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        new CopyWebpackPlugin([
            { from: './app/index.html', to: 'index.html' },
            { from: './app/images', to: 'images' },
            { from: './app/zc', to: 'zc' },
            { from: './app/SIPml-api.js', to: 'SIPml-api.js' },
            { from: './app/shim', to: 'shim' },
            { from: './app/sounds', to: 'sounds' }
        ]),
        // new OpenBrowserPlugin({ url: 'http://localhost:8002' }),
        // commonsPlugin,
        new CommonsChunkPlugin({
            name: ["common", "vendor"],
            minChunks: 2
        }),
        new ExtractTextPlugin("main.css")
    ]
};
