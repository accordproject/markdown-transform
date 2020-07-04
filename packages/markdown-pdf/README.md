# PDF Transformer

Use `PdfTransformer` to transform a PDF to a CiceroMark DOM and vice a versa. Combined with the @accordproject/markdown-cicero
transformations this can be used to convert Markdown text to and from PDF.

## Installation

```
npm install @accordproject/markdown-pdf --save
```

## Usage

### Transform a PDF to CiceroMark

``` javascript
const PdfTransformer = require('@accordproject/markdown-pdf').PdfTransformer;
pdfTransformer = new PdfTransformer();
const json = pdfTransformer.toCiceroMark(pdfBuffer);
```

### Transform CiceroMark to a PDF

``` javascript
const PdfTransformer = require('@accordproject/markdown-pdf').PdfTransformer;
pdfTransformer = new PdfTransformer();
const options = {};
const outputStream = fs.createWriteStream(`./test.pdf`);
pdfTransformer.toPdf(pdfBuffer, options, outputStream );
```

## License <a name="license"></a>
Accord Project source code files are made available under the Apache License, Version 2.0 (Apache-2.0), located in the LICENSE file. Accord Project documentation files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.

© 2017-2019 Clause, Inc.
