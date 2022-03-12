import {setupCore} from '../../setup-core';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {VOID_ELEMENTS} from 'vscode-html-languageservice/lib/umd/languageFacts/fact';

export function testSetup(): ReturnType<typeof setupCore> {
  VOID_ELEMENTS.length = 0;
  return setupCore(() => {
    throw new Error('file opener not supported');
  }, () => {
    throw new Error('file reader not supported');
  });
}
