import type {TextDocument} from 'vscode-languageserver-textdocument';
import {URI} from 'vscode-uri';

export type FtlTextDocument = Omit<TextDocument, 'uri'> & {
  uri: FtlUri
};

export type FtlUri = string | URI;
