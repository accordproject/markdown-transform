'use strict';

const fs = require('fs');

const OoxmlTransformer = require('./OoxmlTransformer');

describe('OOXML -> CiceroMark', () => {

    it('converts ooxml to json', async () => {
        const ooxmlTransformer = new OoxmlTransformer();
        const ooxml = await fs.readFileSync('test/data/ooxml/document.xml', 'utf-8');
        const convertedObject = JSON.stringify(ooxmlTransformer.toCiceroMark(ooxml));
        fs.writeFileSync('./test/output.js', convertedObject);
        // expect(JSON.stringify(ooxmlTransformer.toCiceroMark(ooxml))).toEqual(2);
    });
});