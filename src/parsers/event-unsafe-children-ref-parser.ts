import {FtlXmlParser, ParseContext} from './ftl-xml-parser';
import {FtlEvent} from '../models/ftl-event';
import {events} from '../events';

export class EventUnsafeChildrenRefParser implements FtlXmlParser {
  constructor(private event: FtlEvent) {
  }

  public parseNode(context: ParseContext): void {
    if (!events.isRecursionUnsafeEventRef(context)) return;
    const valueNames = events.getRefName(context);
    if (!valueNames) return;

    if (!this.event.unsafeEventRefs) this.event.unsafeEventRefs = new Set();
    if (Array.isArray(valueNames)) {
      for (const valueName of valueNames) {
        this.event.unsafeEventRefs.add(valueName.name);
      }
    } else {
      this.event.unsafeEventRefs.add(valueNames.name);
    }
  }
}
