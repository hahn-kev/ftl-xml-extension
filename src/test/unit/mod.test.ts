/* eslint-disable max-len */
import {suite, test} from 'mocha';
import {TestHelpers} from './test-helpers';
import {expect} from 'chai';

suite('Mod tags', () => {
  function expectToDefineEvent(contents: string, eventName: string) {
    const services = TestHelpers.testSetup();
    const doc = TestHelpers.testTextDocument(contents);
    const file = services.parser.parseDocument(doc);
    expect(file.event.defs).to.have.length(1);
    const event = file.event.defs[0];
    expect(event.name).to.eq(eventName);
  }

  function expectedToReferenceEvent(contents: string, eventName: string) {
    const services = TestHelpers.testSetup();
    const doc = TestHelpers.testTextDocument(contents);
    const file = services.parser.parseDocument(doc);
    expect(file.event.refs).to.have.any.keys(eventName);
    const eventRefs = file.event.refs.get(eventName);
    if (!eventRefs) throw new Error('event not found');
    expect(eventRefs).to.have.length(2);
    const eventRef = eventRefs.find((e) => !e.isDef);
    expect(eventRef).to.not.be.null;
    if (!eventRef) throw new Error('event ref not found');
    expect(eventRef.name).to.eq(eventName);
  }

  test('tag <mod-append:event> should be recorded as an event definition', () => {
    expectToDefineEvent(`<mod-append:event name="test">`, 'test');
  });

  test('tag <mod-overwrite:event> should be recorded as an event definition', () => {
    expectToDefineEvent(`<mod-overwrite:event name="test">`, 'test');
  });

  test('tag <mod-append:event> should be recorded as an event reference', () => {
    expectedToReferenceEvent(`<event name="test"> <mod-append:event load="test"/>`, 'test');
  });

  test('tag <mod:findName> should be recorded as an event reference', () => {
    expectedToReferenceEvent(`<event name="test"> <mod:findName type="event" name="test"/>`, 'test');
  });

  test('tag <mod:findLike type="event"> should be recorded as an event reference', () => {
    expectedToReferenceEvent(`
        <event name="test"> 
        <mod:findLike type="event">
            <mod:selector name="test"/>
        </mod:findLike>
`, 'test');
  });

  test('tag <mod:findLike type="loadEvent"> should be recorded as an event reference', () => {
    expectedToReferenceEvent(`
        <event name="test"> 
        <mod:findLike type="loadEvent">test</mod:findLike>
`, 'test');
  });

  test('tag <mod:findWithChildLike type="sectorDescription"> <mod:selector> should be recorded as an event reference',
      () => {
        expectedToReferenceEvent(`
        <event name="test"> 
        <mod:findWithChildLike type="sectorDescription" child-type="event"><mod:selector name="test"/></mod:findWithChildLike>
`, 'test');
      });

  test('tag <mod:setAttributes event="test"/> should be recorded as an event reference', () => {
    expectedToReferenceEvent(`
        <event name="test"> 
        <mod:findName type="quest" name="not_important">
            <mod:setAttributes event="test"/>
        </mod:findName>
`, 'test');
  });

  test('tag <mod:setValue> should be recorded as an event reference', () => {
    expectedToReferenceEvent(`
        <event name="test"> 
        <mod:findLike type="loadEvent">
            <mod:setValue>test</mod:setValue>
        </mod:findLike>
`, 'test');
  });

  test('tag <mod:setValue> should be recorded as an event reference when it is a new element', () => {
    expectedToReferenceEvent(`
        <event name="test">
        <mod:findLike type="sectorDescription">
            <mod:setValue><event name="test"/></mod:setValue>
        </mod:findLike>
`, 'test');
  });
//  end of suite
});
