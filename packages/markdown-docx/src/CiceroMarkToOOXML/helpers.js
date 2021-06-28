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

    const HEADING_STYLE_SPEC = `
  <pkg:part pkg:name="/word/styles.xml" pkg:contentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml">
  <pkg:xmlData>
    <w:styles xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml" xmlns:w16cid="http://schemas.microsoft.com/office/word/2016/wordml/cid" xmlns:w16se="http://schemas.microsoft.com/office/word/2015/wordml/symex" mc:Ignorable="w14 w15 w16se w16cid">
      <w:docDefaults>
        <w:rPrDefault>
          <w:rPr>
            <w:rFonts w:asciiTheme="minorHAnsi" w:eastAsiaTheme="minorHAnsi" w:hAnsiTheme="minorHAnsi" w:cstheme="minorBidi"/>
            <w:sz w:val="22"/>
            <w:szCs w:val="22"/>
            <w:lang w:val="en-US" w:eastAsia="en-US" w:bidi="ar-SA"/>
          </w:rPr>
        </w:rPrDefault>
        <w:pPrDefault>
          <w:pPr>
            <w:spacing w:after="160" w:line="259" w:lineRule="auto"/>
          </w:pPr>
        </w:pPrDefault>
      </w:docDefaults>
      <w:latentStyles w:defLockedState="0" w:defUIPriority="99" w:defSemiHidden="0" w:defUnhideWhenUsed="0" w:defQFormat="0" w:count="377">
        <w:lsdException w:name="Normal" w:uiPriority="0" w:qFormat="1"/>
        <w:lsdException w:name="heading 1" w:uiPriority="9" w:qFormat="1"/>
        <w:lsdException w:name="heading 2" w:semiHidden="1" w:uiPriority="9" w:unhideWhenUsed="1" w:qFormat="1"/>
        <w:lsdException w:name="heading 3" w:semiHidden="1" w:uiPriority="9" w:unhideWhenUsed="1" w:qFormat="1"/>
        <w:lsdException w:name="heading 4" w:semiHidden="1" w:uiPriority="9" w:unhideWhenUsed="1" w:qFormat="1"/>
        <w:lsdException w:name="heading 5" w:semiHidden="1" w:uiPriority="9" w:unhideWhenUsed="1" w:qFormat="1"/>
        <w:lsdException w:name="heading 6" w:semiHidden="1" w:uiPriority="9" w:unhideWhenUsed="1" w:qFormat="1"/>
      </w:latentStyles>
      <w:style w:type="paragraph" w:styleId="Heading1">
        <w:name w:val="heading 1" />
        <w:basedOn w:val="Normal" />
        <w:next w:val="Normal" />
        <w:link w:val="Heading1Char" />
        <w:uiPriority w:val="9" />
        <w:qFormat />
        <w:pPr>
            <w:keepNext />
            <w:keepLines />
            <w:spacing w:before="240" w:after="0" />
            <w:outlineLvl w:val="0" />
        </w:pPr>
        <w:rPr>
            <w:rFonts w:asciiTheme="majorHAnsi" w:eastAsiaTheme="majorEastAsia" w:hAnsiTheme="majorHAnsi" w:cstheme="majorBidi" />
            <w:color w:val="2E74B5" w:themeColor="accent1" w:themeShade="BF" />
            <w:sz w:val="32" />
            <w:szCs w:val="32" />
        </w:rPr>
      </w:style>
      <w:style w:type="paragraph" w:styleId="Heading2">
        <w:name w:val="heading 2"/>
        <w:basedOn w:val="Normal"/>
        <w:next w:val="Normal"/>
        <w:link w:val="Heading2Char"/>
        <w:uiPriority w:val="9"/>
        <w:unhideWhenUsed/>
        <w:qFormat/>
        <w:pPr>
          <w:keepNext/>
          <w:keepLines/>
          <w:spacing w:before="40" w:after="0"/>
          <w:outlineLvl w:val="1"/>
        </w:pPr>
        <w:rPr>
          <w:rFonts w:asciiTheme="majorHAnsi" w:eastAsiaTheme="majorEastAsia" w:hAnsiTheme="majorHAnsi" w:cstheme="majorBidi"/>
          <w:color w:val="2E74B5" w:themeColor="accent1" w:themeShade="BF"/>
          <w:sz w:val="26"/>
          <w:szCs w:val="26"/>
        </w:rPr>
      </w:style>
      <w:style w:type="paragraph" w:styleId="Heading3">
        <w:name w:val="heading 3" />
        <w:basedOn w:val="Normal" />
        <w:next w:val="Normal" />
        <w:link w:val="Heading3Char" />
        <w:uiPriority w:val="9" />
        <w:unhideWhenUsed />
        <w:qFormat />
        <w:pPr>
          <w:keepNext />
          <w:keepLines />
          <w:spacing w:before="40" w:after="0" />
          <w:outlineLvl w:val="2" />
        </w:pPr>
        <w:rPr>
          <w:rFonts w:asciiTheme="majorHAnsi" w:eastAsiaTheme="majorEastAsia" w:hAnsiTheme="majorHAnsi" w:cstheme="majorBidi" />
          <w:color w:val="1F4D78" w:themeColor="accent1" w:themeShade="7F" />
          <w:sz w:val="24" />
          <w:szCs w:val="24" />
        </w:rPr>
      </w:style>
      <w:style w:type="paragraph" w:styleId="Heading4">
        <w:name w:val="heading 4" />
        <w:basedOn w:val="Normal" />
        <w:next w:val="Normal" />
        <w:link w:val="Heading4Char" />
        <w:uiPriority w:val="9" />
        <w:unhideWhenUsed />
        <w:qFormat />
        <w:pPr>
          <w:keepNext />
          <w:keepLines />
          <w:spacing w:before="40" w:after="0" />
          <w:outlineLvl w:val="3" />
        </w:pPr>
        <w:rPr>
          <w:rFonts w:asciiTheme="majorHAnsi" w:eastAsiaTheme="majorEastAsia" w:hAnsiTheme="majorHAnsi" w:cstheme="majorBidi" />
          <w:i />
          <w:iCs />
          <w:color w:val="2E74B5" w:themeColor="accent1" w:themeShade="BF" />
        </w:rPr>
      </w:style>
      <w:style w:type="paragraph" w:styleId="Heading5">
        <w:name w:val="heading 5" />
        <w:basedOn w:val="Normal" />
        <w:next w:val="Normal" />
        <w:link w:val="Heading5Char" />
        <w:uiPriority w:val="9" />
        <w:unhideWhenUsed />
        <w:qFormat />
        <w:pPr>
          <w:keepNext />
          <w:keepLines />
          <w:spacing w:before="40" w:after="0" />
          <w:outlineLvl w:val="4" />
        </w:pPr>
        <w:rPr>
          <w:rFonts w:asciiTheme="majorHAnsi" w:eastAsiaTheme="majorEastAsia" w:hAnsiTheme="majorHAnsi" w:cstheme="majorBidi" />
          <w:color w:val="2E74B5" w:themeColor="accent1" w:themeShade="BF" />
        </w:rPr>
      </w:style>
      <w:style w:type="paragraph" w:styleId="Heading6">
        <w:name w:val="heading 6" />
        <w:basedOn w:val="Normal" />
        <w:next w:val="Normal" />
        <w:link w:val="Heading6Char" />
        <w:uiPriority w:val="9" />
        <w:unhideWhenUsed />
        <w:qFormat />
        <w:pPr>
          <w:keepNext />
          <w:keepLines />
          <w:spacing w:before="40" w:after="0" />
          <w:outlineLvl w:val="5" />
        </w:pPr>
        <w:rPr>
          <w:rFonts w:asciiTheme="majorHAnsi" w:eastAsiaTheme="majorEastAsia" w:hAnsiTheme="majorHAnsi" w:cstheme="majorBidi" />
          <w:color w:val="1F4D78" w:themeColor="accent1" w:themeShade="7F" />
        </w:rPr>
      </w:style>
    </w:styles>
  </pkg:xmlData>
  </pkg:part>
    `;

    const RELATIONSHIP_SPEC = `
    <pkg:part pkg:name="/word/_rels/document.xml.rels" pkg:contentType="application/vnd.openxmlformats-package.relationships+xml" pkg:padding="256">
      <pkg:xmlData>
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
          <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
        </Relationships>
      </pkg:xmlData>
    </pkg:part>
    `;

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
    ${RELATIONSHIP_SPEC}
    ${HEADING_STYLE_SPEC}
    </pkg:package>`;

    return ooxml;
}

module.exports = { sanitizeHtmlChars, titleGenerator, wrapAroundDefaultDocxTags };
