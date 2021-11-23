import {Validator} from './validator';
import {FtlFile} from '../models/ftl-file';
import {Diagnostic} from 'vscode';
import {RefMapper} from '../ref-mappers/ref-mapper';
import {FtlEvent} from '../models/ftl-event';
import {FtlShip} from '../models/ftl-ship';
import {DiagnosticBuilder} from '../diagnostic-builder';

export class EventUsedValidator implements Validator {
    constructor(private eventRefMapper: RefMapper<FtlEvent>, private shipMapper: RefMapper<FtlShip>) {

    }

    validateFile(file: FtlFile, diagnostics: Diagnostic[]) {
        let unusedEvents = file.event.defs.filter(event => !this.isEventUsed(event));

        if (unusedEvents.length > 0) {
            diagnostics.push(...unusedEvents.map(event => DiagnosticBuilder.refUnused('Event', event.name, event.range)));
        }
        let unusedShips = file.ship.defs.filter(ship => !this.isShipUsed(ship));
        if (unusedShips.length > 0) {
            diagnostics.push(...unusedShips.map(ship => DiagnosticBuilder.refUnused('Ship', ship.name, ship.range)));
        }
    }

    isEventUsed(event: FtlEvent): boolean {
        return (this.eventRefMapper.refs.get(event.name)?.length ?? 0) > 1;
    }

    isShipUsed(ship: FtlShip): boolean {
        return (this.shipMapper.refs.get(ship.name)?.length ?? 0) > 1;
    }

}
