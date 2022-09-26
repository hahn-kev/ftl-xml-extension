import {suite, test} from 'mocha';
import {TestHelpers} from './test-helpers';
import {expect} from 'chai';
import {EventLoopValidator} from '../../validators/event-loop-validator';
import {FtlDiagnostic} from '../../models/ftl-diagnostic';
import {FtlErrorCode} from '../../diagnostic-builder';

suite('Ftl Events', () => {
  test('should parse all event references', () => {
    const services = TestHelpers.testSetup();
    const document = TestHelpers.testTextDocument(
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
    const services = TestHelpers.testSetup();
    const document = TestHelpers.testTextDocument(
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

  test('should not include event lists as an unsafe child ref', () => {
    const services = TestHelpers.testSetup();
    const document = TestHelpers.testTextDocument(
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

  test('should specify a range for the definition', () => {
    const services = TestHelpers.testSetup();
    const document = TestHelpers.testTextDocument(
        `
<event name="my_event"/> 
`);
    const file = services.parser.parseDocument(document);
    expect(file.event.defs).to.have.length(1);
    const eventDef = file.event.defs[0];
    expect(eventDef.range).to.deep.eq({start: {line: 1, character: 13}, end: {line: 1, character: 21}});
  });

  test('should goto definition from ref', () => {
    const document = TestHelpers.gotoWorks(
        `
<event name="my_$event"/> 
<loadEvent>my_^event</loadEvent>
`);
  });

  test('should find an event loop', () => {
    const services = TestHelpers.testSetup();
    const document = TestHelpers.testTextDocument(
        `
<event name="event_1">
    <event load="event_2"/>
</event>
<event name="event_2">
    <event load="event_3"/>
</event>
<event name="event_3">
    <event load="event_1"/>
</event>
`);
    const file = services.parser.parseDocument(document);
    const validator = new EventLoopValidator(services.mappers.eventsMapper);
    const diagnostics: FtlDiagnostic[] = [];
    validator.validateFile(file, diagnostics);
    expect(diagnostics).to.have.length(3);
  });

  test('should not crash when there is an event loop referenced by an event not in it', () => {
    const services = TestHelpers.testSetup();
    const document = TestHelpers.testTextDocument(
        `
<event name="event_entrance">
    <event load="event_1"/>
</event>
<event name="event_1">
    <event load="event_2"/>
</event>
<event name="event_2">
    <event load="event_1"/>
</event>
`);
    const file = services.parser.parseDocument(document);
    const validator = new EventLoopValidator(services.mappers.eventsMapper);
    const diagnostics: FtlDiagnostic[] = [];
    validator.validateFile(file, diagnostics);
    expect(diagnostics).to.have.length(2);
  });

  test('should show text is required because there is a choice child', () => {
    const services = TestHelpers.testSetup();
    const document = TestHelpers.testTextDocument(
        `
<event name="my_event">
    <choice>
        <text>hello</text>
    </choice>
</event> 
`);
    const file = services.parser.parseDocument(document);
    const requiredChildrenErrors = file.diagnostics.filter(d => d.code == FtlErrorCode.missingRequiredChild);
    expect(requiredChildrenErrors).to.have.length(1);
    const diagnostic = requiredChildrenErrors[0];
    expect(diagnostic.message).to.contain('text');
  });

  test('should not show text is required because there is no choice child', () => {
    const services = TestHelpers.testSetup();
    const document = TestHelpers.testTextDocument(
        `<event name="my_event"></event> `);
    const file = services.parser.parseDocument(document);
    const requiredChildrenErrors = file.diagnostics.filter(d => d.code == FtlErrorCode.missingRequiredChild);
    expect(requiredChildrenErrors).to.be.empty;
  });

  test('choice should show text is required', () => {
    const services = TestHelpers.testSetup();
    const document = TestHelpers.testTextDocument(`<choice></choice> `);
    const file = services.parser.parseDocument(document);
    const requiredChildrenErrors = file.diagnostics.filter(d => d.code == FtlErrorCode.missingRequiredChild);
    expect(requiredChildrenErrors).to.have.length(1);
    const diagnostic = requiredChildrenErrors[0];
    expect(diagnostic.message).to.contain('text');
  });
});
