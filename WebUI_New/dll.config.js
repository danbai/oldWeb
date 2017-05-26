const webpack = require('webpack');

const vendors = [
    'antd',
    'echarts',
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
    output: {
        path: 'build',
        filename: 'vendors.js',
        library: 'vendors',
    },
    entry: {
        "lib": vendors,
    },
    plugins: [
        new webpack.DllPlugin({
            path: 'manifest.json',
            name: 'vendors',
            context: __dirname,
        }),
    ],
};