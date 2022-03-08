import {FtlXmlParser, ParseContext} from './ftl-xml-parser';
import {HyperspaceFile} from '../models/hyperspace-file';
import {getNodeTextContent} from '../helpers';

export class CustomEventFilesParser implements FtlXmlParser {
  public parseNode(context: ParseContext): void {
    if (context.node.tag != 'eventFile') return;
    if (context.file instanceof HyperspaceFile) {
      const name = getNodeTextContent(context.node, context.document);
      if (name) {
        context.file.customEventFiles.add(name);
      }
    }
  }
}
