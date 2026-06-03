/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const path = require('path');
const webpack = require('webpack');
const packageJson = require('./package.json');

module.exports = {
    entry: { client: ['./src/index.ts'] },
    output: {
        path: path.join(__dirname, 'umd'),
        filename: 'markdown-html.js',
        library: { name: 'markdown-html', type: 'umd' },
        umdNamedDefine: true,
    },
    plugins: [
        new webpack.BannerPlugin(`Markdown Transform v${packageJson.version}`),
        new webpack.DefinePlugin({ 'process.env': { 'NODE_ENV': JSON.stringify('production') } }),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            // webpack 5 no longer polyfills `process` automatically.
            process: 'process/browser',
        }),
        new webpack.IgnorePlugin({ resourceRegExp: /^\.$/, contextRegExp: /jsdom$/ }),
    ],
    resolve: {
        extensions: ['.ts', '.js'],
        // jsdom is only required when DOMParser is unavailable (i.e. Node).
        // In the browser UMD bundle the require is unreachable, so replace
        // it with an empty module so webpack doesn't pull in ~4 MB of jsdom.
        alias: { jsdom: false },
        fallback: {
            'assert': false,
            'fs': false,
            'tls': false,
            'net': false,
            'path': false,
            'os': false,
            'util': false,
            'url': false,
            'child_process': false,
            'crypto': require.resolve('crypto-browserify'),
            'stream': require.resolve('stream-browserify'),
            'http': require.resolve('stream-http'),
            'https': require.resolve('https-browserify'),
            'zlib': require.resolve('browserify-zlib'),
            'buffer': require.resolve('buffer/'),
            'vm': require.resolve('vm-browserify'),
        },
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                include: [path.join(__dirname, 'src')],
                exclude: /\.test\.ts$/,
                use: [{
                    loader: 'ts-loader',
                    options: { transpileOnly: true, configFile: path.join(__dirname, 'tsconfig.json') },
                }],
            },
        ],
    },
};
