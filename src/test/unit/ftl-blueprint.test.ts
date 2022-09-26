import {suite, test} from 'mocha';
import {TestHelpers} from './test-helpers';
import {expect} from 'chai';
import {Diagnostic} from 'vscode-html-languageservice';
import {DiagnosticBuilder, FtlErrorCode} from '../../diagnostic-builder';

suite('blueprint tests', () => {
  test('a list can have a name in it', ()=> {
    const services = TestHelpers.testSetup();
    const document = TestHelpers.testTextDocument(`
        <augBlueprint name="my-test-aug"/>
<blueprintList name="my-list">
<name>my-test-aug</name>
</blueprintList>
        `);
    const file = services.parser.parseDocument(document);
    expect(file.augment.defs).to.have.lengthOf(1);
    expect(file.blueprintList.defs).to.have.lengthOf(1);
    const diag: Diagnostic[] = [];
    services.validators.forEach(v => v.validateFile(file, diag));
    expect(diag).to.be.empty;
  });

  test('a mixed list should have an error', ()=> {
    const services = TestHelpers.testSetup();
    const document = TestHelpers.testTextDocument(`
        <augBlueprint name="my-test-aug"/>
        <weaponBlueprint name="weapon-1"/>
        <weaponBlueprint name="weapon-2"/>
<blueprintList name="my-list">
<name>my-test-aug</name>
<name>weapon-1</name>
<name>weapon-2</name>
</blueprintList>
        `);
    const file = services.parser.parseDocument(document);
    const diagnostics: Diagnostic[] = [];
    services.validators.forEach(v => v.validateFile(file, diagnostics));
    expect(diagnostics).to.have.lengthOf(1);
    const diag = diagnostics[0];
    expect(diag.code).to.eq(FtlErrorCode.listTypeMismatch);
  });

  test('a weapon referencing an augment should have an error', ()=> {
    const services = TestHelpers.testSetup();
    const document = TestHelpers.testTextDocument(`
        <augBlueprint name="my-test-aug"/>
        <weaponBlueprint name="weapon-1"/>
        <weapon name="my-test-aug"/>
        `);
    const file = services.parser.parseDocument(document);
    const diagnostics: Diagnostic[] = [];
    services.validators.forEach(v => v.validateFile(file, diagnostics));
    expect(diagnostics).to.have.lengthOf(1);
    const diag = diagnostics[0];
    expect(diag.code).to.eq(FtlErrorCode.refTypeInvalid);
  });

  test('a weapon referencing an augment list should have an error', ()=> {
    const services = TestHelpers.testSetup();
    const document = TestHelpers.testTextDocument(`
<augBlueprint name="my-test-aug"/>
<blueprintList name="aug-list">
  <name>my-test-aug</name>
</blueprintList>
<weapon name="aug-list"/>
        `);
    const file = services.parser.parseDocument(document);
    const diagnostics: Diagnostic[] = [];
    services.validators.forEach(v => v.validateFile(file, diagnostics));
    expect(diagnostics).to.have.lengthOf(1);
    const diag = diagnostics[0];
    expect(diag.code).to.eq(FtlErrorCode.refTypeInvalid);
  });

  test('a blueprint list loop should have an error', ()=> {
    const services = TestHelpers.testSetup();
    const document = TestHelpers.testTextDocument(`

<blueprintList name="list1">
  <name>list2</name>
</blueprintList>
<blueprintList name="list2">
  <name>list1</name>
</blueprintList>

        `);
    const file = services.parser.parseDocument(document);
    const diagnostics: Diagnostic[] = [];
    services.validators.forEach(v => v.validateFile(file, diagnostics));
    expect(diagnostics).to.have.lengthOf(2);
    const diag = diagnostics[0];
    expect(diag.code).to.eq(FtlErrorCode.refLoop);
  });

  test('a blueprint list 3 deep should have an error', ()=> {
    return; // test disabled for now
    const services = TestHelpers.testSetup();
    const document = TestHelpers.testTextDocument(`

<blueprintList name="list1">
  <name>list2</name>
</blueprintList>
<blueprintList name="list2">
  <name>list3</name>
</blueprintList>
<blueprintList name="list3">
  <name>list4</name>
</blueprintList>
<blueprintList name="list4">
</blueprintList>

        `);
    const file = services.parser.parseDocument(document);
    const diagnostics: Diagnostic[] = [];
    services.validators.forEach(v => v.validateFile(file, diagnostics));
    expect(diagnostics).to.have.lengthOf(2);
    const diag = diagnostics[0];
    expect(diag.code).to.eq(FtlErrorCode.refLoop);
  });

  test('a req can reference a weapon', () => {
    TestHelpers.gotoWorks(`
<weaponBlueprint name="$weapon-1"/>
<event>
    <text> some text</text>
    <choice req="weapon^-1"></choice>
</event>
        `);
  });

  test('a req can reference an aug', () => {
    TestHelpers.gotoWorks(`
<augBlueprint name="$aug1"/>
<event>
    <text> some text</text>
    <choice req="aug^1"></choice>
</event>
        `);
  });

  test('a req can reference an sector', () => {
    TestHelpers.gotoWorks(`
<sectorDescription name="$MySuperSecret"/>
<event>
    <text> some text</text>
    <choice req="SEC ^MySuperSecret"></choice>
</event>
        `);
  });

  test('a sector req does not have a warning', () => {
    const services = TestHelpers.testSetup();
    const document = TestHelpers.testTextDocument(`
        <sectorDescription name="MySuperSecret"/>
        <event>
            <text> some text</text>
            <choice req="SEC MySuperSecret"></choice>
        </event>
                
            `);
    const file = services.parser.parseDocument(document);
    const diagnostics: Diagnostic[] = [];
    services.validators.forEach(v => v.validateFile(file, diagnostics));
    expect(diagnostics).to.have.lengthOf(0);
  });
});
