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

'use strict';

const P = require('parsimmon');
const textParser = require('./lib/coreparsers').textParser;
const seqParser =  require('./lib/coreparsers').seqParser;

function itemParser(parser) {
    return P.seq(textParser('\n- '),parser);
}
function listParser(parser) {
    return itemParser(parser).many();
}
function stringListParser(text) {
    return listParser(textParser(text));
}
function twoListsParser(text1,text2) {
    return P.seq(stringListParser(text1),stringListParser(text2));
}

console.log('===== One List');
console.log(JSON.stringify(stringListParser('item').parse('\n- item')));
console.log(JSON.stringify(stringListParser('item').parse('')));
console.log(JSON.stringify(stringListParser('item').parse('\n- item\n- item\n- item\n- item\n- item')));

console.log('===== Two Lists');
console.log(JSON.stringify(twoListsParser('foo','bar').parse('\n- foo\n- bar')));
console.log(JSON.stringify(twoListsParser('foo','foo').parse('\n- foo\n- foo')));
