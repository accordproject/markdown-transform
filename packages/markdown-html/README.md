# HTML Transformer

Use `HtmlTransformer` to transform a CiceroMark DOM into an HTML String.

## Installation

```
npm install @accordproject/markdown-html --save
```

## Usage

``` javascript
const CiceroMarkTransformer = require('@accordproject/markdown-cicero').CiceroMarkTransformer;
const HtmlTransformer = require('@accordproject/markdown-html').HtmlTransformer;
htmlTransformer = new HtmlTransformer();
ciceroTransformer = new CiceroMarkTransformer();
const json = ciceroTransformer.fromMarkdown(markdownText, 'json');
const html = htmlTransformer.toHtml(json);
```

## License <a name="license"></a>
Accord Project source code files are made available under the Apache License, Version 2.0 (Apache-2.0), located in the LICENSE file. Accord Project documentation files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.

© 2017-2019 Clause, Inc.
