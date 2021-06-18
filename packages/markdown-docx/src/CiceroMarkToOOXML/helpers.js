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

/**
 * Replaces the angular brackets with the respective codes.
 *
 * @param {string} node String to be replaced
 * @returns {string} String with replaced angular brackets
 */
function sanitizeHtmlChars(node) {
    return node.replace(/>/g, '&gt;').replace(/</g, '&lt;');
}

/**
 * Generates a title from the variable using the title and type.
 *
 * @param {string} title Title of the variable. E.g. Receiver-1, Shipper-1
 * @param {string} type  Type of the variable
 * @returns {string} New title combining title and type
 */
function titleGenerator(title, type) {
    return `${title} | ${type}`;
}

/**
 * Wraps OOXML in docx headers.
 *
 * @param {string} ooxml OOXML to be wrapped
 * @returns {string} OOXML wraped in docx headers
 */
function wrapAroundDefaultDocxTags(ooxml) {
    ooxml = `<pkg:package
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

    return ooxml;
}

/**
 * Gets the class of a given CiceroMark node.
 *
 * @param {object} node CiceroMark node entity
 * @returns {string} Class of given node
 */
function getClass(node) {
    return node.$class;
}

module.exports = { sanitizeHtmlChars, titleGenerator, wrapAroundDefaultDocxTags, getClass };
