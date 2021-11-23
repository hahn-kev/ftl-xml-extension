import {Validator} from './validator';
import {FtlFile} from '../models/ftl-file';
import {Diagnostic, DiagnosticSeverity, TextDocument} from 'vscode';
import {RefMapper} from '../ref-mappers/ref-mapper';
import {FtlEvent} from '../models/ftl-event';
import {FtlShip} from '../models/ftl-ship';

export class EventUsedValidator implements Validator {
    constructor(private eventRefMapper: RefMapper<FtlEvent>, private shipMapper: RefMapper<FtlShip>) {

    }

    validateFile(file: FtlFile, document: TextDocument, diagnostics: Diagnostic[]) {
        let unusedEvents = file.event.defs.filter(event => !this.isEventUsed(event));

        if (unusedEvents.length > 0) {
            diagnostics.push(...unusedEvents.map(event => new Diagnostic(
                event.range,
                `Event: ${event.name} is not used anywhere, is this a bug?`,
                DiagnosticSeverity.Information)));
        }
        let unusedShips = file.ship.defs.filter(ship => !this.isShipUsed(ship));
        if (unusedShips.length > 0) {
            diagnostics.push(...unusedShips.map(ship => new Diagnostic(
                ship.range,
                `Ship: ${ship.name} is not used anywhere, is this a bug?`,
                DiagnosticSeverity.Information
            )));
        }
    }

    isEventUsed(event: FtlEvent): boolean {
        return (this.eventRefMapper.refs.get(event.name)?.length ?? 0) > 1;
    }

    isShipUsed(ship: FtlShip): boolean {
        return (this.shipMapper.refs.get(ship.name)?.length ?? 0) > 1;
    }

}
