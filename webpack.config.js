var path = require('path');

module.exports = {
    entry: './src/client/main.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve('./build/client')
    },
    module: {
        rules: [{
            test: /\.ts?$/,
            loader: 'awesome-typescript-loader?configFileName=./src/client/tsconfig.json',
            exclude: /node_modules/
        }]
    },
    resolve: {
        extensions: ['.ts', '.js']
    }
}