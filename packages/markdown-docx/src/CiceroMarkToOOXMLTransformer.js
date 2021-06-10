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

const { TEXT_RULE } = require('./rules');

// const OoxmlTransformer = require('./OoxmlTransformer');

/**
 * Transforms the ciceromark to OOXML
 */
class CiceroMarkToOOXMLTransfomer {

    /**
     * Declares the nodes and global OOXML.
     */
    constructor(){
        this.definedNodes = {
            computedVariable: 'org.accordproject.ciceromark.ComputedVariable',
            heading: 'org.accordproject.commonmark.Heading',
            item: 'org.accordproject.commonmark.Item',
            list: 'org.accordproject.commonmark.List',
            listBlock: 'org.accordproject.ciceromark.ListBlock',
            paragraph: 'org.accordproject.commonmark.Paragraph',
            softbreak: 'org.accordproject.commonmark.Softbreak',
            text: 'org.accordproject.commonmark.Text',
            variable: 'org.accordproject.ciceromark.Variable',
            emphasize: 'org.accordproject.commonmark.Emph',
        };
        this.globalOOXML= '';
    }

    /**
     * Gets the class of a given CiceroMark Node.
     *
     * @param {object} node CiceroMark node entity
     * @returns {string} Class of given node
     */
    getClass(node) {
        return node.$class;
    }

    /**
     * Gets the OOXML for the given node.
     *
     * @param {object} node    Description of node type
     * @param {object} counter Counter for different variables based on node name
     * @param {object} parent  Parent object for a node
     * @returns {string} OOXML for the given node
     */
    getNodes(node, counter, parent = null) {
        if (this.getClass(node) === this.definedNodes.text) {
            if (parent !== null && parent.class === this.definedNodes.emphasize) {
                return TEXT_RULE(node.text, true);
            } else {
                return TEXT_RULE(node.text);
            }
        }

        if (this.getClass(node) === this.definedNodes.emphasize) {
            let ooxml = '';
            node.nodes.forEach(subNode => {
                ooxml += this.getNodes(subNode, counter, { class: node.$class });
            });
            return ooxml;
        }

        if (this.getClass(node) === this.definedNodes.paragraph) {
            let ooxml = '';
            node.nodes.forEach(subNode => {
                ooxml += this.getNodes(subNode, counter, );
            });
            this.globalOOXML = `${this.globalOOXML}<w:p>${ooxml}</w:p>`;
        }
        return '';
    }

    /**
     * Wraps OOXML in docx headers.
     *
     * @param {string} ooxml OOXML to be wrapped
     */
    wrapOOXML(ooxml){
        this.globalOOXML = `<pkg:package
        xmlns:pkg="http://schemas.microsoft.com/office/2006/xmlPackage">
        <pkg:part pkg:name="/_rels/.rels" pkg:contentType="application/vnd.openxmlformats-package.relationships+xml" pkg:padding="512">
            <pkg:xmlData>
                <Relationships
                    xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
                    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
                </Relationships>
            </pkg:xmlData>
        </pkg:part>
        <pkg:part pkg:name="/word/document.xml" pkg:contentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml">
            <pkg:xmlData>
                <w:document
                    xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
                    xmlns:cx="http://schemas.microsoft.com/office/drawing/2014/chartex"
                    xmlns:cx1="http://schemas.microsoft.com/office/drawing/2015/9/8/chartex"
                    xmlns:cx2="http://schemas.microsoft.com/office/drawing/2015/10/21/chartex"
                    xmlns:cx3="http://schemas.microsoft.com/office/drawing/2016/5/9/chartex"
                    xmlns:cx4="http://schemas.microsoft.com/office/drawing/2016/5/10/chartex"
                    xmlns:cx5="http://schemas.microsoft.com/office/drawing/2016/5/11/chartex"
                    xmlns:cx6="http://schemas.microsoft.com/office/drawing/2016/5/12/chartex"
                    xmlns:cx7="http://schemas.microsoft.com/office/drawing/2016/5/13/chartex"
                    xmlns:cx8="http://schemas.microsoft.com/office/drawing/2016/5/14/chartex"
                    xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
                    xmlns:aink="http://schemas.microsoft.com/office/drawing/2016/ink"
                    xmlns:am3d="http://schemas.microsoft.com/office/drawing/2017/model3d"
                    xmlns:o="urn:schemas-microsoft-com:office:office"
                    xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
                    xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
                    xmlns:v="urn:schemas-microsoft-com:vml"
                    xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
                    xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
                    xmlns:w10="urn:schemas-microsoft-com:office:word"
                    xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
                    xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
                    xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml"
                    xmlns:w16cid="http://schemas.microsoft.com/office/word/2016/wordml/cid"
                    xmlns:w16se="http://schemas.microsoft.com/office/word/2015/wordml/symex"
                    xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
                    xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
                    xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
                    xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="w14 w15 w16se w16cid wp14">
                    <w:body>
                        ${ooxml}
                        <w:p/>
                    </w:body>
                </w:document>
            </pkg:xmlData>
        </pkg:part>
        </pkg:package>`;
    }

    /**
     * Transforms the given CiceroMark JSON to OOXML
     *
     * @param {Object} ciceromark CiceroMark JSON to be converted
     * @param {Object} counter    Counter for different variables based on node name
     * @param {string} ooxml      Initial OOXML string
     * @returns {string} Converted OOXML string i.e. CicecoMark->OOXML
     */
    toOOXML(ciceromark, counter, ooxml = '') {
        this.globalOOXML = ooxml;
        ciceromark.nodes.forEach(node => {
            this.getNodes(node, counter);
        });
        this.wrapOOXML(this.globalOOXML);
        return this.globalOOXML;
    }
}

module.exports = CiceroMarkToOOXMLTransfomer;