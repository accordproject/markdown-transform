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

/* eslint-disable no-undef */
// @ts-nocheck
'use strict';
const PluginManager = require('./PluginManager');
const FromMarkdown = require('./fromMarkdown');
const ToMarkdown = require('./toMarkdown');
const ListPlugin = require('./plugins/ListPlugin');

let fromMarkdown = null;
let toMarkdown = null;

// eslint-disable-next-line no-undef
beforeAll(() => {
    const plugins = [new ListPlugin(null)];
    const pluginManager = new PluginManager(plugins);
    fromMarkdown = new FromMarkdown(pluginManager);
    toMarkdown = new ToMarkdown(pluginManager);
});

/* Roundtrips */

test('can roundtrip basic text', () => {
    const markdownText = 'This is some text.';
    const value = fromMarkdown.convert(markdownText);
    const markdownRound = toMarkdown.convert(value);
    const valueRound = fromMarkdown.convert(markdownRound);
    expect(valueRound).toMatchSnapshot();
});

test('can roundtrip italic text', () => {
    const markdownText = 'This is *some* text.';
    const value = fromMarkdown.convert(markdownText);
    const markdownRound = toMarkdown.convert(value);
    const valueRound = fromMarkdown.convert(markdownRound);
    expect(valueRound).toMatchSnapshot();
});

test('can roundtrip bold text', () => {
    const markdownText = 'This is **some** text.';
    const value = fromMarkdown.convert(markdownText);
    const markdownRound = toMarkdown.convert(value);
    // expect(markdownRound).toMatch(markdownText);
    const valueRound = fromMarkdown.convert(markdownRound);
    expect(valueRound).toMatchSnapshot();
});

test('can roundtrip bold italic text', () => {
    const markdownText = 'This is ***some*** text.';
    const value = fromMarkdown.convert(markdownText);
    const markdownRound = toMarkdown.convert(value);
    // expect(markdownRound).toMatch(markdownText);
    const valueRound = fromMarkdown.convert(markdownRound);
    expect(valueRound).toMatchSnapshot();
});

test('can roundtrip h1 to slate', () => {
    const markdownText = '# Heading One';
    const value = fromMarkdown.convert(markdownText);
    const markdownRound = toMarkdown.convert(value);
    // expect(markdownRound).toMatch(markdownText);
    const valueRound = fromMarkdown.convert(markdownRound);
    expect(valueRound).toMatchSnapshot();
});

test('can roundtrip h2', () => {
    const markdownText = '## Heading Two';
    const value = fromMarkdown.convert(markdownText);
    const markdownRound = toMarkdown.convert(value);
    // expect(markdownRound).toMatch(markdownText);
    const valueRound = fromMarkdown.convert(markdownRound);
    expect(valueRound).toMatchSnapshot();
});

test('can roundtrip h3', () => {
    const markdownText = '### Heading Three';
    const value = fromMarkdown.convert(markdownText);
    const markdownRound = toMarkdown.convert(value);
    // expect(markdownRound).toMatch(markdownText);
    const valueRound = fromMarkdown.convert(markdownRound);
    expect(valueRound).toMatchSnapshot();
});

test('can roundtrip h4', () => {
    const markdownText = '#### Heading Four';
    const value = fromMarkdown.convert(markdownText);
    const markdownRound = toMarkdown.convert(value);
    // expect(markdownRound).toMatch(markdownText);
    const valueRound = fromMarkdown.convert(markdownRound);
    expect(valueRound).toMatchSnapshot();
});

test('can roundtrip h5', () => {
    const markdownText = '##### Heading Five';
    const value = fromMarkdown.convert(markdownText);
    const markdownRound = toMarkdown.convert(value);
    // expect(markdownRound).toMatch(markdownText);
    const valueRound = fromMarkdown.convert(markdownRound);
    expect(valueRound).toMatchSnapshot();
});

test('can roundtrip h6', () => {
    const markdownText = '###### Heading Six';
    const value = fromMarkdown.convert(markdownText);
    const markdownRound = toMarkdown.convert(value);
    // expect(markdownRound).toMatch(markdownText);
    const valueRound = fromMarkdown.convert(markdownRound);
    expect(valueRound).toMatchSnapshot();
});

test('can roundtrip paragraphs', () => {
    const markdownText = `This is first paragraph.
  
  This is second paragraph.`;
    const value = fromMarkdown.convert(markdownText);
    const markdownRound = toMarkdown.convert(value);
    // expect(markdownRound).toMatch(markdownText);
    const valueRound = fromMarkdown.convert(markdownRound);
    expect(valueRound).toMatchSnapshot();
});

test('can roundtrip inline code', () => {
    const markdownText = 'This is `inline code`.';
    const value = fromMarkdown.convert(markdownText);
    const markdownRound = toMarkdown.convert(value);
    // expect(markdownRound).toMatch(markdownText);
    const valueRound = fromMarkdown.convert(markdownRound);
    expect(valueRound).toMatchSnapshot();
});

test('can roundtrip a link', () => {
    const markdownText = 'This is [a link](http://clause.io).';
    const value = fromMarkdown.convert(markdownText);
    const markdownRound = toMarkdown.convert(value);
    // expect(markdownRound).toMatch(markdownText);
    const valueRound = fromMarkdown.convert(markdownRound);
    expect(valueRound).toMatchSnapshot();
});

test('can roundtrip a thematic break', () => {
    const markdownText = `This is 
  
  ---
  A footer.`;
    const value = fromMarkdown.convert(markdownText);
    const markdownRound = toMarkdown.convert(value);
    // expect(markdownRound).toMatch(markdownText);
    const valueRound = fromMarkdown.convert(markdownRound);
    expect(valueRound).toMatchSnapshot();
});

test('can roundtrip a blockquote', () => {
    const markdownText = `This is
  > A quote.`;
    const value = fromMarkdown.convert(markdownText);
    const markdownRound = toMarkdown.convert(value);
    // expect(markdownRound).toMatch(markdownText);
    const valueRound = fromMarkdown.convert(markdownRound);
    expect(valueRound).toMatchSnapshot();
});

test('can roundtrip a multiline html block', () => {
    const markdownText = `This is a custom
  
  <custom src="property">
  contents
  </custom>

  block.`;
    const value = fromMarkdown.convert(markdownText);
    const markdownRound = toMarkdown.convert(value);
    // expect(markdownRound).toMatch(markdownText);
    const valueRound = fromMarkdown.convert(markdownRound);
    expect(valueRound).toMatchSnapshot();
});

test('can roundtrip an ordered list', () => {
    const markdownText = `This is an ordered list:
1. one
1. two
1. three

Done.`;
    const value = fromMarkdown.convert(markdownText);
    const markdownRound = toMarkdown.convert(value);
    // expect(markdownRound).toMatch(markdownText);
    const valueRound = fromMarkdown.convert(markdownRound);
    expect(valueRound).toMatchSnapshot();
});

test('can roundtrip an unordered list', () => {
    const markdownText = `This is an unordered list:
* one
* two
* three

Done.`;
    const value = fromMarkdown.convert(markdownText);
    const markdownRound = toMarkdown.convert(value);
    // expect(markdownRound).toMatch(markdownText);
    const valueRound = fromMarkdown.convert(markdownRound);
    expect(valueRound).toMatchSnapshot();
});

test('can roundtrip a single line html block', () => {
    const markdownText = 'This is a <custom src="property"/> property.';
    const value = fromMarkdown.convert(markdownText);
    const markdownRound = toMarkdown.convert(value);
    // expect(markdownRound).toMatch(markdownText);
    const valueRound = fromMarkdown.convert(markdownRound);
    expect(valueRound).toMatchSnapshot();
});

test('can roundtrip a code block', () => {
    const markdownText = `\`\`\`
  this is a multiline
  code
  block.
  \`\`\``;
    const value = fromMarkdown.convert(markdownText);
    const markdownRound = toMarkdown.convert(value);
    // expect(markdownRound).toMatch(markdownText);
    const valueRound = fromMarkdown.convert(markdownRound);
    expect(valueRound).toMatchSnapshot();
});

