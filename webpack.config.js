const path = require('path')
const webpack = require('webpack')

module.exports = {
    mode: 'development',
    entry: {
        index: './src/index/index.js',
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: [[
                        "@babel/preset-env",
                        {
                            "useBuiltIns": 'usage',
                            "corejs": 3,
                            "targets": "defaults"
                        }
                    ]]
                }
            }
        }]
    },
    output: {
        filename: '[name].js',
        path: __dirname + '/dist'
    },
    devServer: {
        contentBase: path.join(__dirname, "/"),
        port: 8888
    }
};