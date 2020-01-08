# Markdown Transform CLI

Command line tool to debug and use markdown transformations.

## Installation

```
npm install -g @accordproject/markdown-cli
```

## Usage

The command-line is called `markus` and offers the following commands:

```
markus <cmd> [args]

Commands:
  markus parse      parse and transform a sample markdown, pdf or docx file
  markus draft      create markdown text from data
  markus normalize  normalize a sample markdown (parse & redraft)

Options:
  --version      Show version number                                   [boolean]
  --verbose, -v                                                 [default: false]
  --help         Show help                                             [boolean]
```

### Parse from Markdown

The `parse` command lets you parse markdown and create a document object model from it.

```
markus parse

parse and transform a sample markdown

Options:
  --version      Show version number                                   [boolean]
  --verbose, -v  verbose output                       [boolean] [default: false]
  --help         Show help                                             [boolean]
  --sample       path to the markdown text, pdf, docx                   [string]
  --output       path to the output file                                [string]
  --cicero       further transform to CiceroMark      [boolean] [default: false]
  --slate        further transform to Slate DOM       [boolean] [default: false]
  --html         further transform to HTML            [boolean] [default: false]
```

### Generate markdown from data

The `draft` command lets you take a document object model and generate markdown text from it.

```
markus draft

create markdown text from data

Options:
  --version      Show version number                                   [boolean]
  --verbose, -v  verbose output                       [boolean] [default: false]
  --help         Show help                                             [boolean]
  --data         path to the data                                       [string]
  --output       path to the output file                                [string]
  --cicero       input data is a CiceroMark DOM       [boolean] [default: false]
  --slate        input data is a Slate DOM            [boolean] [default: false]
  --html         input data is HTML                   [boolean] [default: false]
  --noWrap       do not wrap CiceroMark variables as XML tags
                                                      [boolean] [default: false]
  --noIndex      do not index ordered lists           [boolean] [default: false]
```

### Normalize the markdown

The `normalize` command lets you parse markdown and re-draft it from its document object model.

```
markus normalize

normalize a sample markdown (parse & redraft)

Options:
  --version      Show version number                                   [boolean]
  --verbose, -v  verbose output                       [boolean] [default: false]
  --help         Show help                                             [boolean]
  --sample       path to the markdown text                              [string]
  --output       path to the output file                                [string]
  --cicero       further transform to CiceroMark      [boolean] [default: false]
  --slate        further transform to Slate DOM       [boolean] [default: false]
  --html         further transform to HTML            [boolean] [default: false]
  --noWrap       do not wrap variables as XML tags    [boolean] [default: false]
  --noIndex      do not index ordered lists           [boolean] [default: false]
```

## License <a name="license"></a>
Accord Project source code files are made available under the Apache License, Version 2.0 (Apache-2.0), located in the LICENSE file. Accord Project documentation files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.

© 2017-2019 Clause, Inc.
