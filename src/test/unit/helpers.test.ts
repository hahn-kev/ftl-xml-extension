/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {suite, test} from 'mocha';
import {TestHelpers} from './test-helpers';
import {expect} from 'chai';

suite('helpers', () => {
  test('getAttrValueRange should work', ()=> {
    const services = TestHelpers.testSetup();
    const document = TestHelpers.testTextDocument(
        `
<text id="someTextId">
</text>
`);
    const file = services.parser.parseDocument(document);
    const ftlTextRefs = file.text.refs.get('someTextId');
    expect(ftlTextRefs).to.have.lengthOf(1);
    const ftlText = ftlTextRefs![0];
    expect(ftlText.range.start.character).to.eq(10);
    expect(ftlText.range.end.character).to.eq(20);
  });

  test('getAttrValueRange should work with weird spacing', ()=> {
    const services = TestHelpers.testSetup();
    const document = TestHelpers.testTextDocument(
        `
<text id = "someTextId">
</text>
`);
    const file = services.parser.parseDocument(document);
    const ftlTextRefs = file.text.refs.get('someTextId');
    expect(ftlTextRefs).to.have.lengthOf(1);
    const ftlText = ftlTextRefs![0];
    expect(ftlText.range.start.character).to.eq(12);
    expect(ftlText.range.end.character).to.eq(22);
  });

  test('getAttrValueRange should work with name conflicts', ()=> {
    const services = TestHelpers.testSetup();
    const document = TestHelpers.testTextDocument(
        `
<text tide="test" id="someTextId">
</text>
`);
    const file = services.parser.parseDocument(document);
    const ftlTextRefs = file.text.refs.get('someTextId');
    expect(ftlTextRefs).to.have.lengthOf(1);
    const ftlText = ftlTextRefs![0];
    expect(ftlText.range.start.character).to.eq(22);
    expect(ftlText.range.end.character).to.eq(32);
  });
});
