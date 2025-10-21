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
pdfTransformer.toPdf(ciceroMarkJson, options, outputStream );
```

### Unicode Font Support

> Note: The default Liberation fonts support Latin characters only. For Unicode support (Cyrillic, Chinese, Arabic, etc.), provide custom fonts via the `fonts` parameter.

 Example:
``` javascript
const { PdfTransformer, defaultFonts } = require('@accordproject/markdown-pdf');

// Extend default fonts with a Unicode-capable font
const customFonts = {
    ...defaultFonts,
    NotoSans: {
        normal: '/path/to/NotoSans-Regular.ttf',
        bold: '/path/to/NotoSans-Bold.ttf',
        italics: '/path/to/NotoSans-Italic.ttf',
        bolditalics: '/path/to/NotoSans-BoldItalic.ttf'
    }
};

const pdfmakeDOM = await PdfTransformer.ciceroMarkToPdfMake(ciceroMarkJson);
pdfmakeDOM.defaultStyle = { fontSize: 12, font: 'NotoSans', lineHeight: 1.5 };

const pdfBuffer = await PdfTransformer.pdfMakeToPdfBuffer(
    pdfmakeDOM, 
    null,  // progress callback
    customFonts  // your custom fonts
);
```

## License <a name="license"></a>
Accord Project source code files are made available under the Apache License, Version 2.0 (Apache-2.0), located in the LICENSE file. Accord Project documentation files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.

© 2017-2020 Clause, Inc.
