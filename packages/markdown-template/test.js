const MarkdownIt = require('markdown-it');
const MarkdownItIns = require('./index')['markdown-it-template'];
const parser = new MarkdownIt({html:true}).use(MarkdownItIns);

const markdown = `
Paragraph with a {{seller}} and more text and{{#if forceMajeure}}, this is optional,{{/if}} with some **marker** {{% 1+1 = 3 %}}.

{{buyer as "FOO"}}
`;

const tokenStream = parser.parse(markdown,{});
console.log(JSON.stringify(tokenStream,null,2));
