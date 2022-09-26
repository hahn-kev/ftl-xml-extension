import {setupCore} from '../../setup-core';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {VOID_ELEMENTS} from 'vscode-html-languageservice/lib/umd/languageFacts/fact';
import {FtlTextDocument} from '../../models/ftl-text-document';
import {TextDocument} from 'vscode-languageserver-textdocument';
import {defaultXmlFilesAndAppends, defaultXmlFiles} from '../../data/default-ftl-data/default-xml-files';
import {Location} from 'vscode-html-languageservice';
import {expect} from 'chai';
import { LookupContext } from '../../ref-mappers/lookup-provider';

class TestHelpersImp {
  static testSetup(): ReturnType<typeof setupCore> {
    defaultXmlFilesAndAppends.push('test.xml');
    defaultXmlFiles.push('test.xml');

    VOID_ELEMENTS.length = 0;
    return setupCore(() => {
      throw new Error('file opener not supported');
    }, () => {
      throw new Error('file reader not supported');
    });
  }

  static testTextDocument(contents: string): FtlTextDocument {
    return TextDocument.create('test://test/test.xml',
        'ftl-xml',
        1, contents);
  }

  static gotoWorks(stringWithCarrotAnd$: gotoString) {
    const [endOffset, tmpString]= extractLocation(stringWithCarrotAnd$, '$');
    const [startOffset, contents] = extractLocation(tmpString, '^');

    const services = this.testSetup();
    const document = this.testTextDocument(contents);
    services.parser.parseDocument(document);
    const htmlDocument = services.documentCache.getHtmlDocument(document);
    const node = htmlDocument.findNodeAt(startOffset);
    const startPosition = document.positionAt(startOffset);
    const context: LookupContext = {document, node, position: startPosition};
    const defs: Location[] = [];
    for (const lookup of services.lookupProviders) {
      const def = lookup.lookupDef(context);
      if (def) defs.push(def);
    }
    expect(defs).to.have.lengthOf(1, 'should find 1 definition');
    const def = defs[0];
    expect(endOffset).to.be.lessThanOrEqual(document.offsetAt(def.range.end))
        .and.greaterThanOrEqual(document.offsetAt(def.range.start));
  }
}
type gotoString = `${string}$${string}^${string}`;
type helperMethodNames = Exclude<keyof typeof TestHelpersImp, 'prototype'>;
export const TestHelpers: Pick<typeof TestHelpersImp, helperMethodNames> = TestHelpersImp;

/**
 * takes a string with a $ in it, removes the $ and returns the location
 * @param {string} str string to parse
 * @param {string} searchString string to find and remove
 * @return {[number, string]} the location and the string without the $
 */
export function extractLocation(str: string, searchString = '$'): [number, string] {
  const offset = str.indexOf(searchString);
  return [offset, str.slice(0, offset) + str.slice(offset + 1)];
}
