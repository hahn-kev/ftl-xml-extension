import {expect} from 'chai';
import {suite, test} from 'mocha';
import { FtlErrorCode } from '../../diagnostic-builder';
import { getNodeContent } from '../../helpers';
import {FtlEvent} from '../../models/ftl-event';
import {TestHelpers} from './test-helpers';

suite('Ftl Parser', () => {
  test('should parse some events', () => {
    const services = TestHelpers.testSetup();
    const document = TestHelpers.testTextDocument(`<event name="my_event"/> <event load="my_event"/>"`);

    const file = services.parser.parseDocument(document);
    expect(file.fileName).to.eq('test.xml');

    expect(file.event.defs).length(1);
    const def = file.event.defs[0];
    expect(def.name).eq('my_event');

    expect(file.event.refs).to.have.keys('my_event');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const refs: FtlEvent[] = file.event.refs.get('my_event')!;
    expect(refs).length(2);
    expect(refs).to.include(def);
    const ref = refs.filter((r) => r != def)[0];
    expect(ref.name).to.eq('my_event');
  });

  test('should properly parse img tags', () => {
    const services = TestHelpers.testSetup();
    const document = TestHelpers.testTextDocument(`<img>text content</img>`);
    const htmlDoc = services.documentCache.getHtmlDocument(document);
    const content = getNodeContent(htmlDoc.roots[0], document)?.name;
    expect(content).to
    .eq('text content', 'this is probably because the img tag was treated as an empty tag like it is in normal html');
  });

  const xmlList = [
    `<badTag>event-1`, 
  `<badTag>event-1</badTag `,
  `<badTag/`,
  // disabled because they don't currently work.
  // `text </badTag>`,
  // `<tag> badTag> test</badTag></tag>`
];
  for (const xml of xmlList) {
    test('should warn for invalid xml: ' + xml, () => {
      const services = TestHelpers.testSetup();
      const document = TestHelpers.testTextDocument(xml);

      const file = services.parser.parseDocument(document);
      const invalidTagErrors = file.diagnostics.filter(d => d.code == FtlErrorCode.tagNotClosed);
      expect(invalidTagErrors).to.have.length.greaterThan(0);
    });
  }
});
