import {expect} from 'chai';
import {suite, test} from 'mocha';
import {extractLocation, TestHelpers} from './test-helpers';
import {FtlCompletionProvider} from '../../providers/ftl-completion-provider';
import {IValueSet} from 'vscode-html-languageservice';
import {
  EventNamesValueSet,
  ImgPathNames, ShipBlueprintNames,
  ShipIconFileNames,
  ShipIconNames,
  ShipNames
} from '../../data/autocomplete-value-sets';
import {FtlServices} from '../../setup-core';
import {URI} from 'vscode-uri';

suite('code completion', () => {
  function expectTextCompletesWith(textWith$: string, valueSet: IValueSet, services?: FtlServices) {
    const [offset, text] = extractLocation(textWith$);
    services ??= TestHelpers.testSetup();
    const completionProvider = new FtlCompletionProvider(services.documentCache,
        services.htmlService,
        services.mappers.blueprintMapper);
    const document = TestHelpers.testTextDocument(text);

    services.parser.parseDocument(document);
    expect(valueSet.values).to.has.length.gt(1);

    const completionItems = completionProvider.provideCompletionItems(document, document.positionAt(offset));
    expect(completionItems).to.not.be.empty;
    const item = completionItems.find(c => c.label == valueSet.values[0].name);
    expect(item).to.not.be.undefined;
  }

  test('should complete with an event name', () => {
    // language=XML
    expectTextCompletesWith('<loadEvent>$</loadEvent>', EventNamesValueSet);
  });

  test('should complete with ship names', () => {
    // language=XML
    expectTextCompletesWith('<shipOrder><ship>$</ship></shipOrder>', ShipNames);
  });

  test('should complete with img path names', () => {
    // language=XML
    expectTextCompletesWith(`
        <imageList>
            <img>$</img>
        </imageList>`, ImgPathNames);
  });

  test('should complete with ship icon names', () => {
    // language=XML
    expectTextCompletesWith(`

        <shipIcons>
            <shipIcon>
                <name>test icon 1</name>
                <name>test icon 2</name>
            </shipIcon>
            <shipIcon>$</shipIcon>
        </shipIcons>`, ShipIconNames);
  });

  test('should complete with ship icon file names', () => {
    const services = TestHelpers.testSetup();
    services.parser.parseFiles([
      URI.file('/test/img/combatUI/icons/test1.png'),
      URI.file('/test/img/combatUI/icons/test2.png'),
    ], false);
    // language=XML
    expectTextCompletesWith(`
        <shipIcon>
            <name>$</name>
        </shipIcon>`, ShipIconFileNames, services);
  });

  test('should complete with ship blueprint names', () => {
    // language=XML
    expectTextCompletesWith(`
        <otherUnlocks>
            <ship>$</ship>
        </otherUnlocks>`, ShipBlueprintNames);
  });
});
