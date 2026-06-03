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
        filename: 'markdown-template.js',
        library: { name: 'markdown-template', type: 'umd' },
        umdNamedDefine: true,
    },
    plugins: [
        new webpack.BannerPlugin(`Markdown Transform v${packageJson.version}`),
        new webpack.DefinePlugin({ 'process.env': { 'NODE_ENV': JSON.stringify('production') } }),
        // Some transitive deps reference the Node `process` global. webpack 5 no longer
        // polyfills it, so we provide a minimal browser shim.
        new webpack.ProvidePlugin({ process: 'process/browser' }),
        new webpack.IgnorePlugin({ resourceRegExp: /^\.$/, contextRegExp: /jsdom$/ }),
    ],
    resolve: {
        extensions: ['.ts', '.js'],
        // Transitive deps (asn1.js, parse-asn1, etc. pulled in by crypto-browserify)
        // statically reference Node built-ins on code paths that are unreachable in
        // the browser. Explicitly set them to `false` so webpack doesn't emit
        // "Module not found" warnings.
        fallback: {
            'fs': false,
            'tls': false,
            'net': false,
            'path': false,
            'os': false,
            'util': false,
            'url': false,
            'vm': false,
            'crypto': require.resolve('crypto-browserify'),
            'stream': require.resolve('stream-browserify'),
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
