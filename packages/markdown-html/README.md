# HTML Transformer

Converts a CiceroMark DOM to/from an HTML string.

## Installation

```
npm install @accordproject/markdown-html
```

## Usage

```ts
import { CiceroMarkTransformer } from '@accordproject/markdown-cicero';
import { HtmlTransformer } from '@accordproject/markdown-html';

const ciceroTransformer = new CiceroMarkTransformer();
const htmlTransformer = new HtmlTransformer();

// markdown → CiceroMark DOM → HTML
const dom = ciceroTransformer.fromMarkdown('# Hello\n\nWorld.');
const html = htmlTransformer.toHtml(dom);

// HTML → CiceroMark DOM
const roundTripped = htmlTransformer.toCiceroMark(html);
```

In CommonJS:

```js
const { CiceroMarkTransformer } = require('@accordproject/markdown-cicero');
const { HtmlTransformer } = require('@accordproject/markdown-html');
```

## Using in web apps

This package depends on [`jsdom`](https://github.com/jsdom/jsdom) for HTML parsing in Node, but uses the browser's built-in `DOMParser` when it is available. Bundlers targeting the web (webpack 5, Vite, Rollup, esbuild) select the package's browser build through the `browser` condition of its `exports` map, and that build leaves `jsdom` out, so no bundler configuration is needed.

## License <a name="license"></a>
Accord Project source code files are made available under the Apache License, Version 2.0 (Apache-2.0), located in the LICENSE file. Accord Project documentation files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.
