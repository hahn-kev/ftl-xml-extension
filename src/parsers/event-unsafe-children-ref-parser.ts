import {FtlXmlParser, ParseContext} from './ftl-xml-parser';
import {FtlEvent} from '../models/ftl-event';
import {events} from '../events';

export class EventUnsafeChildrenRefParser implements FtlXmlParser {
  constructor(private event: FtlEvent) {
  }

  public parseNode(context: ParseContext): void {
    if (!events.isRecursionUnsafeEventRef(context)) return;
    const names = events.getRefName(context.node, context.document);
    if (names) {
      if (!this.event.unsafeEventRefs) this.event.unsafeEventRefs = new Set();
      if (typeof names === 'string') {
        this.event.unsafeEventRefs.add(names);
      } else {
        for (const name of names) {
          this.event.unsafeEventRefs.add(name);
        }
      }
    }
  }
}
