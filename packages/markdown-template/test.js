const MarkdownIt = require('markdown-it');
const MarkdownItTemplate = require('./lib/markdown-it-template');
const parser = new MarkdownIt({html:true}).use(MarkdownItTemplate);

const markdown = `
Paragraph with a {{seller}} and more text and{{#if forceMajeure}}, this is optional,{{/if}} with some **marker** {{% 1+1 = 3 %}}.

{{buyer as "FOO"}}

{{#clause payment}}
BLABLABLABLA


{{#ulist items}}
one item
{{/ulist}}



{{/clause}}
`;

const tokenStream = parser.parse(markdown,{});
console.log(JSON.stringify(tokenStream,null,2));

