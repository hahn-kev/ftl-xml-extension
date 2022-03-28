import {RefParser} from './ref-parser';
import {FtlEvent} from '../models/ftl-event';
import {ParseContext} from '../parsers/ftl-xml-parser';
import {EventUnsafeChildrenRefParser} from '../parsers/event-unsafe-children-ref-parser';

export class EventRefParser extends RefParser<FtlEvent> {
  public override parseNode(context: ParseContext) {
    const nameDef = this.getNameDef(context);
    if (nameDef) {
      const event = this.handleDefinition(context, nameDef);
      return context.isModNode ? undefined : new EventUnsafeChildrenRefParser(event);
    }

    const nameRefs = this.getRefName(context.node, context.document);
    if (nameRefs) {
      this.handleReference(context, nameRefs);
    }
  }
}
