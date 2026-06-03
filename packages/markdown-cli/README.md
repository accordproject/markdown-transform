# Command Line

Install the `@accordproject/markdown-cli` npm package to get the `markus` command line interface (CLI). After installation you can use the `markus` command and its sub-commands as described below.

To install:

```bash
npm install -g @accordproject/markdown-cli
```

## Usage

`markus` is a command line tool to debug and use markdown transformations.

```md
markus <cmd> [args]

Commands:
  markus transform  transform between two formats

Options:
  --version      Show version number                                   [boolean]
  --verbose, -v                                                 [default: false]
  --help         Show help                                             [boolean]
```

## `markus transform`

The `markus transform` command lets you transform between any two of the supported formats.

```md
markus transform

transform between two formats

Options:
  --version      Show version number                                   [boolean]
  --verbose, -v  verbose output                       [boolean] [default: false]
  --help         Show help                                             [boolean]
  --input        path to the input                                      [string]
  --from         source format                    [string] [default: "markdown"]
  --to           target format                  [string] [default: "commonmark"]
  --via          intermediate formats                      [array] [default: []]
  --roundtrip    roundtrip transform                  [boolean] [default: false]
  --output       path to the output file                                [string]
  --model        array of concerto model files                           [array]
  --template     template grammar                                       [string]
  --contract     contract template                    [boolean] [default: false]
  --currentTime  set current time                       [string] [default: null]
  --plugin       path to a parser plugin                                [string]
  --extension    path to a transform extension                           [array]
  --sourcePos    enable source position               [boolean] [default: false]
  --offline      do not resolve external models       [boolean] [default: false]
```

Supported formats for `--from` / `--to` / `--via`:

`markdown`, `markdown_cicero`, `markdown_template`, `commonmark_tokens`, `ciceromark_tokens`, `templatemark_tokens`, `commonmark`, `ciceromark`, `ciceromark_parsed`, `ciceromark_unquoted`, `templatemark`, `ciceroedit`, `html`, `plaintext`.

### Example

Run `transform` on a markdown file:

```bash
markus transform --input README.md
```

returns:

```json
{
  "$class": "org.accordproject.commonmark@0.5.0.Document",
  "xmlns": "http://commonmark.org/xml/1.0",
  "nodes": [
    {
      "$class": "org.accordproject.commonmark@0.5.0.Heading",
      "level": "1",
      "nodes": [
        {
          "$class": "org.accordproject.commonmark@0.5.0.Text",
          "text": "Hello World"
        }
      ]
    },
    {
      "$class": "org.accordproject.commonmark@0.5.0.Paragraph",
      "nodes": [
        {
          "$class": "org.accordproject.commonmark@0.5.0.Text",
          "text": "This is the Hello World of Accord Project Templates. Executing the clause will simply echo back the text that occurs after the string "
        },
        {
          "$class": "org.accordproject.commonmark@0.5.0.Code",
          "text": "Hello"
        },
        {
          "$class": "org.accordproject.commonmark@0.5.0.Text",
          "text": " prepended to text that is passed in the request."
        }
      ]
    }
  ]
}
```

### `--from` and `--to` options

Set the source and target formats. The following converts markdown to HTML:

```bash
markus transform --from markdown --to html --input README.md
```

returns:

```html
<html>
<body>
<div class="document">
<h1>Hello World</h1>
<p>This is the Hello World of Accord Project Templates. Executing the clause will simply echo back the text that occurs after the string <code>Hello</code> prepended to text that is passed in the request.</p>
</div>
</body>
</html>
```

### `--via` option

When there are several paths between two formats, you can route through an intermediate format. The following transforms from `markdown` to `html` *via* `ciceromark`:

```bash
markus transform --from markdown --via ciceromark --to html --input README.md
```

### `--roundtrip` option

You can roundtrip between two formats — transform from source to target then back to source. For example, `markdown → ciceromark → markdown`:

```bash
markus transform --from markdown --to ciceromark --input README.md --roundtrip
```

returns:

```bash
Hello World
====

This is the Hello World of Accord Project Templates. Executing the clause will simply echo back the text that occurs after the string `Hello` prepended to text that is passed in the request.
```

Roundtripping might result in small textual differences in the source markdown but should always be semantically equivalent. In the example above the ATX heading `# Hello World` has been transformed into the equivalent Setext heading.

### `--model` and `--contract` options

When handling [TemplateMark](https://docs.accordproject.org/docs/markdown-templatemark), provide a Concerto model with `--model` and add `--contract` if the template is a contract (otherwise it is treated as a clause).

For instance, the following converts a TemplateMark file to its DOM:

```bash
markus transform \
  --from markdown_template --to templatemark \
  --model model/model.cto \
  --input text/grammar.tem.md
```

returns:

```json
{
  "$class": "org.accordproject.commonmark@0.5.0.Document",
  "xmlns": "http://commonmark.org/xml/1.0",
  "nodes": [
    {
      "$class": "org.accordproject.templatemark@0.5.0.ClauseDefinition",
      "name": "top",
      "elementType": "org.accordproject.helloworld.HelloWorldClause",
      "nodes": [
        {
          "$class": "org.accordproject.commonmark@0.5.0.Paragraph",
          "nodes": [
            {
              "$class": "org.accordproject.commonmark@0.5.0.Text",
              "text": "Name of the person to greet: "
            },
            {
              "$class": "org.accordproject.templatemark@0.5.0.VariableDefinition",
              "name": "name",
              "elementType": "String"
            },
            {
              "$class": "org.accordproject.commonmark@0.5.0.Text",
              "text": "."
            },
            {
              "$class": "org.accordproject.commonmark@0.5.0.Softbreak"
            },
            {
              "$class": "org.accordproject.commonmark@0.5.0.Text",
              "text": "Thank you!"
            }
          ]
        }
      ]
    }
  ]
}
```

### `--extension` option

Pass `--extension path/to/ext.js` (repeatable) to register a custom transform extension at runtime. An extension is a module that exports `{ format?, transforms? }` where `format` declares a new format and `transforms` declares edges to/from it in the transformation graph. See the integration tests in this package for examples.

## License <a name="license"></a>
Accord Project source code files are made available under the Apache License, Version 2.0 (Apache-2.0), located in the LICENSE file. Accord Project documentation files are made available under the Creative Commons Attribution 4.0 International License (CC-BY-4.0), available at http://creativecommons.org/licenses/by/4.0/.
