import {FtlXmlParser, ParseContext} from './ftl-xml-parser';
import {HyperspaceFile} from '../models/hyperspace-file';
import {getNodeContent, nodeTagEq} from '../helpers';

export class CustomEventFilesParser implements FtlXmlParser {
  public parseNode(context: ParseContext): void {
    if (!nodeTagEq(context.node, 'eventFile')) return;
    if (context.file instanceof HyperspaceFile) {
      const name = getNodeContent(context.node, context.document)?.name;
      if (name) {
        context.file.customEventFiles.add(name);
      }
    }
  }
}
