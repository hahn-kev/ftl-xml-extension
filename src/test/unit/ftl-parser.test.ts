import {expect} from 'chai';
import {suite, test} from 'mocha';
import {TextDocument as HtmlTextDocument} from 'vscode-html-languageservice';
import {FtlEvent} from '../../models/ftl-event';
import {testSetup} from './test-setup';

suite('Ftl Parser', () => {
  test('should parse some events', () => {
    const services = testSetup();
    const document = HtmlTextDocument.create('test://test/test.xml',
        'ftl-xml',
        1,
        `<event name="my_event"/> <event load="my_event"/>"`);

    const file = services.parser.parseDocument(document);
    expect(file.fileName).to.eq('test.xml');

    expect(file.event.defs).length(1);
    const def = file.event.defs[0];
    expect(def.name).eq('my_event');

    expect(file.event.refs).to.have.keys('my_event');
    const refs: FtlEvent[] = file.event.refs.get('my_event')!;
    expect(refs).length(2);
    expect(refs).to.include(def);
    const ref = refs.filter((r) => r != def)[0];
    expect(ref.name).to.eq('my_event');
  });
});
