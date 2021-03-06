import {Node} from 'vscode-html-languageservice';
import {FtlTextDocument} from './models/ftl-text-document';
import {getFileName, hasAncestor} from './helpers';

export class Sounds {
  static readonly validSoundFileNames = ['dlcSounds.xml', 'dlcSounds.xml.append', 'sounds.xml', 'sounds.xml.append'];
  static isWaveNode(node: Node, document: FtlTextDocument): node is Node & {tag:string} {
    if (!node.tag || node.tag == 'FTL') return false;
    const docFileName = getFileName(document);
    return !!docFileName && this.validSoundFileNames.includes(docFileName) && !hasAncestor(node, 'music', true);
  }
}
