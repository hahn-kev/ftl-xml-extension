import {Validator} from './validator';
import {FtlDiagnostic} from '../models/ftl-diagnostic';
import {FtlFile} from '../models/ftl-file';
import {FtlEvent} from '../models/ftl-event';
import {RefMapper} from '../ref-mappers/ref-mapper';
import {DiagnosticBuilder} from '../diagnostic-builder';
import {findRecursiveLoop} from '../helpers';

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
      throw new Error(`Finding loop in '${event.name}' caused by: ${e}`);
    }
  }

  private findEventLoop(topEventName: string, unsafeChildren: Set<string>): string[] | undefined {
    return findRecursiveLoop(topEventName, unsafeChildren, (name) => this.eventMapper.defs.get(name)?.unsafeEventRefs);
  }
}
