import {Validator} from './validator';
import {FtlDiagnostic} from '../models/ftl-diagnostic';
import {FtlFile} from '../models/ftl-file';
import {FtlEvent} from '../models/ftl-event';
import {RefMapper} from '../ref-mappers/ref-mapper';
import {DiagnosticBuilder} from '../diagnostic-builder';

export class EventLoopValidator implements Validator {
  constructor(private eventMapper: RefMapper<FtlEvent>) {
  }

  public validateFile(file: FtlFile, diagnostics: FtlDiagnostic[]): void {
    for (const event of file.event.defs) {
      const diag = this.validateEventLoop(event);
      if (diag) diagnostics.push(diag);
    }
  }

  private validateEventLoop(event: FtlEvent): FtlDiagnostic | undefined {
    if (!event.unsafeEventRefs) return;
    try {
      const namesInLoop = this.findEventLoop(event.name, event.unsafeEventRefs);
      if (namesInLoop) return DiagnosticBuilder.eventHasRefLoop(event.range, event.name, namesInLoop);
    } catch (e) {
      throw new Error('error finding loop in ' + event.name);
    }
  }

  private findEventLoop(topEventName: string, unsafeChildren: Set<string>): string[] | undefined {
    for (const childName of unsafeChildren) {
      if (childName == topEventName) return [];
      const event = this.eventMapper.defs.get(childName);
      if (!event || !event.unsafeEventRefs) continue;
      const result = this.findEventLoop(topEventName, event.unsafeEventRefs);
      if (result) {
        result.unshift(childName);
        return result;
      }
    }
  }
}
