# CiceroMark Transform

This package extends CommonMark to introduce three new DOM nodes:
1. Clause
2. Variable
3. ComputedVariable

These are expressed using markdown code blocks and html inlines to ensure that they are safely persisted within markdown text.

Use `CiceroMarkTransform` to map from the CommonMark DOM nodes to CiceroMark DOM nodes.

## Installation

```
npm install @accordproject/markdown-cicero --save
```

## Usage

``` javascript

const CiceroMarkTransformer = require('@accordproject/markdown-cicero').CiceroMarkTransformer;

const ciceroMarkTransformer = new CiceroMarkTransformer();
const dom = ciceroMarkTransformer.fromMarkdown( '# Heading One');
const newMarkdown = ciceroMarkTransformer.toMarkdown(dom);
```

## License <a name="license"></a>
Accord Project source code files are made available under the Apache License, Version 2.0 (Apache-2.0), located in the LICENSE file. Accord Project documentation files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.

© 2017-2019 Clause, Inc.
