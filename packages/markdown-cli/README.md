# Markdown Transform CLI

Command line tool to debug and use markdown transformations.

## Installation

```
npm install -g @accordproject/markdown-cli
```

## Usage

```
markus parse

parse and transform sample markdown

Options:
  --version      Show version number                                   [boolean]
  --verbose, -v                                                 [default: false]
  --help         Show help                                             [boolean]
  --sample       path to the clause text                                [string]
  --out          path to the output file                                [string]
  --roundtrip    roundtrip                            [boolean] [default: false]
  --cicero       further transform to CiceroMark      [boolean] [default: false]
  --slate        further transform to Slate DOM       [boolean] [default: false]
  --html         further transform to HTML            [boolean] [default: false]
  --noWrap       do not wrap variables as XML tags    [boolean] [default: false]
  --noIndex      do not index ordered lists           [boolean] [default: false]
```

## License <a name="license"></a>
Accord Project source code files are made available under the Apache License, Version 2.0 (Apache-2.0), located in the LICENSE file. Accord Project documentation files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.

© 2017-2019 Clause, Inc.
