# PDF Transformer

Use `PdfTransformer` to transform a PDF to a CiceroMark DOM.

## Installation

```
npm install @accordproject/markdown-pdf --save
```

## Usage

``` javascript
const PdfTransformer = require('@accordproject/markdown-pdf').PdfTransformer;
pdfTransformer = new PdfTransformer();
const json = pdfTransformer.toCiceroMark(pdfBuffer);
```

## License <a name="license"></a>
Accord Project source code files are made available under the Apache License, Version 2.0 (Apache-2.0), located in the LICENSE file. Accord Project documentation files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.

© 2017-2019 Clause, Inc.
