/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// @ts-nocheck
/* eslint-disable no-undef */
'use strict';

const CommonmarkParser = require('./CommonmarkParser');
let parser = null;

// @ts-ignore
beforeAll(() => {
    parser = new CommonmarkParser();
});

test('can convert basic text', async () => {
    const markdownText = 'This is some text.';
    const value = parser.parse(markdownText);
    expect(value).toMatchSnapshot();
});

test('can convert italic text', async () => {
    const markdownText = 'This is *some* text.';
    const value = parser.parse(markdownText);
    expect(value).toMatchSnapshot();
});

test('can convert bold text', async () => {
    const markdownText = 'This is **some** text.';
    const value = parser.parse(markdownText);
    expect(value).toMatchSnapshot();
});

test('can convert bold italic text', async () => {
    const markdownText = 'This is ***some*** text.';
    const value = parser.parse(markdownText);
    expect(value).toMatchSnapshot();
});

test('can convert h1 to slate', async () => {
    const markdownText = '# Heading One';
    const value = parser.parse(markdownText);
    expect(value).toMatchSnapshot();
});

test('can convert h2', async () => {
    const markdownText = '## Heading Two';
    const value = parser.parse(markdownText);
    expect(value).toMatchSnapshot();
});

test('can convert h3', async () => {
    const markdownText = '### Heading Three';
    const value = parser.parse(markdownText);
    expect(value).toMatchSnapshot();
});

test('can convert h4', async () => {
    const markdownText = '#### Heading Four';
    const value = parser.parse(markdownText);
    expect(value).toMatchSnapshot();
});

test('can convert h5', async () => {
    const markdownText = '##### Heading Five';
    const value = parser.parse(markdownText);
    expect(value).toMatchSnapshot();
});

test('can convert h6', async () => {
    const markdownText = '###### Heading Six';
    const value = parser.parse(markdownText);
    expect(value).toMatchSnapshot();
});

test('can convert paragraphs', async () => {
    const markdownText = `This is first paragraph.
  
  This is second paragraph.`;
    const value = parser.parse(markdownText);
    expect(value).toMatchSnapshot();
});

test('can convert inline code', async () => {
    const markdownText = 'This is `inline code`.';
    const value = parser.parse(markdownText);
    expect(value).toMatchSnapshot();
});

test('can convert a link', async () => {
    const markdownText = 'This is [a link](http://clause.io).';
    const value = parser.parse(markdownText);
    expect(value).toMatchSnapshot();
});

test('can convert a thematic break', async () => {
    const markdownText = `This is 
  
  ---
  A footer.`;
    const value = parser.parse(markdownText);
    expect(value).toMatchSnapshot();
});

test('can convert a blockquote', async () => {
    const markdownText = `This is
  > A quote.`;
    const value = parser.parse(markdownText);
    expect(value).toMatchSnapshot();
});

test('can convert a multiline html block', async () => {
    const markdownText = `This is a custom
  
  <custom src="property">
  contents
  </custom>

  block.`;
    const value = parser.parse(markdownText);
    expect(value).toMatchSnapshot();
});

test('can convert an ordered list', async () => {
    const markdownText = `This is an ordered list:
1. one
1. two
1. three

Done.`;
    const value = parser.parse(markdownText);
    expect(value).toMatchSnapshot();
});

test('can convert an unordered list', async () => {
    const markdownText = `This is an unordered list:
* one
* two
* three

Done.`;
    const value = parser.parse(markdownText);
    expect(value).toMatchSnapshot();
});

test('can convert a single line html block', async () => {
    const markdownText = 'This is a <custom src="property"/> property.';
    const value = parser.parse(markdownText);
    expect(value).toMatchSnapshot();
});

test('can convert a code block', async () => {
    const markdownText = `\`\`\`
  this is a multiline
  code
  block.
  \`\`\``;
    const value = parser.parse(markdownText);
    expect(value).toMatchSnapshot();
});

test('can convert a custom code block', async () => {
    const markdownText = `\`\`\` <video src="https://www.youtube.com/embed/dQw4w9WgXcQ"/>
  this is a multiline
  code

  containing a newline

  which should be handled by the video plugin.
  \`\`\``;
    const value = parser.parse(markdownText);
    expect(value).toMatchSnapshot();
});

test('can convert a video block', async () => {
    const markdownText = `
  # Heading One
  
  <video src="https://www.youtube.com/embed/dQw4w9WgXcQ"/>
  `;
    const value = parser.parse(markdownText);
    expect(value).toMatchSnapshot();
});
