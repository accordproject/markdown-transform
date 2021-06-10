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

const chai = require('chai');

const expect = chai.expect;

const OoxmlTransformer = require('./OoxmlTransformer');
const CiceroMarkToOOXMLTransfomer = require('./CiceroMarkToOOXMLTransformer');

describe('Round Tripping', () => {

    it('Pargaphs and emphasis', async () => {
        const ciceroMarkJSON = {
            '$class':'org.accordproject.commonmark.Document',
            'xmlns':'http://commonmark.org/xml/1.0',
            'nodes':[
                {
                    '$class':'org.accordproject.commonmark.Paragraph',
                    'nodes':[
                        {
                            '$class':'org.accordproject.commonmark.Text',
                            'text':'Hello and Welcome to the testing round. Today we try '
                        },
                        {
                            '$class':'org.accordproject.commonmark.Emph',
                            'nodes':[
                                {
                                    '$class':'org.accordproject.commonmark.Text',
                                    'text':'testing'
                                }
                            ]
                        },
                        {
                            '$class':'org.accordproject.commonmark.Text',
                            'text':' of the converters.'
                        }
                    ]
                },
                {
                    '$class':'org.accordproject.commonmark.Paragraph',
                    'nodes':[
                        {
                            '$class':'org.accordproject.commonmark.Text',
                            'text':'Let\'s start with the basic testing of the converters.'
                        }
                    ]
                },
                {
                    '$class':'org.accordproject.commonmark.Paragraph',
                    'nodes':[
                        {
                            '$class':'org.accordproject.commonmark.Text',
                            'text':'The Accord Project is a non-profit, collaborative, initiative developing an ecosystem and open source tools specifically for smart legal contracts. Open source means that anyone can freely use and contribute to development.'
                        }
                    ]
                },
                {
                    '$class':'org.accordproject.commonmark.Paragraph',
                    'nodes':[
                        {
                            '$class':'org.accordproject.commonmark.Text',
                            'text':'We hope to see many more successful tests.'
                        }
                    ]
                }
            ]
        };
        const ciceroMarkTransformer = new CiceroMarkToOOXMLTransfomer();
        const ooxml = ciceroMarkTransformer.toOOXML(ciceroMarkJSON);

        const ooxmlTransformer = new OoxmlTransformer();
        const convertedObject = ooxmlTransformer.toCiceroMark(ooxml);
        expect(convertedObject).to.deep.equal(ciceroMarkJSON);
    });
});