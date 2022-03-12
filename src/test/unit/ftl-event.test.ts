import {suite, test} from 'mocha';
import {testSetup} from './test-setup';
import {TextDocument as HtmlTextDocument} from 'vscode-html-languageservice';
import {expect} from 'chai';

suite('Ftl Events', () => {
  test('should parse all event references', () => {
    const services = testSetup();
    const document = HtmlTextDocument.create('test://test/test.xml',
        'ftl-xml',
        1,
        `
<!--definition-->
<event name="my_event"/> 
<eventList name="my_event_list">
    <event load="my_event"/>
</eventList>

<!--refs-->
<event load="my_event"/>
<loadEventList>
    <event name="my_event"/>
</loadEventList>
<sectorDescription>
    <event name="my_event"/>
</sectorDescription>
<exitBeacon event="my_event" nebulaEvent="my_event" rebelEvent="my_event"/>
<rebelBeacon event="my_event" nebulaEvent="my_event"/>
<eventAlias name="my_event">my_event</eventAlias>

<startEvent>my_event</startEvent>
<loadEvent>my_event</loadEvent>
<nebulaEvent>my_event</nebulaEvent>
<jumpEvent>my_event</jumpEvent>
<deathEvent>my_event</deathEvent>
<revisitEvent>my_event</revisitEvent>
<queueEvent>my_event</queueEvent>
<renameBeacon>my_event</renameBeacon>

<triggeredEvent event="my_event"/>
<loadEventList default="my_event"/>
<destroyed load="my_event"/>
<deadCrew load="my_event"/>
<surrender load="my_event"/>
<escape load="my_event"/>
<gotaway load="my_event"/>
<quest event="my_event"/>
`);

    const file = services.parser.parseDocument(document);
    expect(file.event.defs).length(2);
    const eventDef = file.event.defs.find((e) => e.name == 'my_event');
    expect(eventDef).to.not.be.null;
    const eventList = file.event.defs.find((e) => e.name == 'my_event_list');
    expect(eventList).to.not.be.null;

    expect(file.event.refs).to.have.keys('my_event', 'my_event_list');
    const refs = file.event.refs.get('my_event');
    if (!refs) throw new Error('refs not found');

    expect(refs).length(28);
  });

  test('should show unsafe child event references', () => {
    const services = testSetup();
    const document = HtmlTextDocument.create('test://test/test.xml',
        'ftl-xml',
        1,
        `
<event name="event_def">
    <choice>
        <event load="event_ref_1"/>
    </choice>
    <choice>
        <event load="event_ref_2"/>
    </choice>
    <choice>
        <event load="event_ref_2"/>
    </choice>
    <choice>
        <event>
            <loadEvent>event_ref_4</loadEvent>
        </event>
    </choice>
    <choice>
        <event>
            <choice>
                <event load="event_ref_3"/>            
            </choice>        
        </event>
    </choice>
</event>
<event>
    <choice>
<!--    should not be included because it's not inside the event def above-->
        <event load="event_ref_4"/>
    </choice>
</event>
`);
    const file = services.parser.parseDocument(document);
    expect(file.event.defs).length(1);
    const eventDef = file.event.defs[0];
    expect(eventDef.unsafeEventRefs).to.have.all.keys('event_ref_1', 'event_ref_2', 'event_ref_3');
  });
  test('should not include vent lists as an unsafe child ref', () => {
    const services = testSetup();
    const document = HtmlTextDocument.create('test://test/test.xml',
        'ftl-xml',
        1,
        `
<eventList name="event_def">
      <event load="event_ref_1"/>
      <event load="event_ref_2"/>
</eventList>
`);
    const file = services.parser.parseDocument(document);
    expect(file.event.defs).length(1);
    const eventDef = file.event.defs[0];
    expect(eventDef.unsafeEventRefs).to.be.undefined;
  });
});
