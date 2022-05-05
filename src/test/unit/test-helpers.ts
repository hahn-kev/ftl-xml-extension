import {setupCore} from '../../setup-core';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {VOID_ELEMENTS} from 'vscode-html-languageservice/lib/umd/languageFacts/fact';
import {FtlTextDocument} from '../../models/ftl-text-document';
import {TextDocument} from 'vscode-languageserver-textdocument';
import {defaultXmlFilesAndAppends, defaultXmlFiles} from '../../data/default-ftl-data/default-xml-files';

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
}

type helperMethodNames = Exclude<keyof typeof TestHelpersImp, 'prototype'>;
export const TestHelpers: Pick<typeof TestHelpersImp, helperMethodNames> = TestHelpersImp;

/**
 * takes a string with a $ in it, removes the $ and returns the location
 * @param {string} str string to parse
 * @return {[number, string]} the location and the string without the $
 */
export function extractLocation(str: string): [number, string] {
  const offset = str.indexOf('$');
  return [offset, str.substr(0, offset) + str.substr(offset + 1)];
}
