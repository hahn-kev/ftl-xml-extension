import {NodeMapContext} from './node-map-context';
import {ValueName} from '../value-name';

export interface NodeMap {
  getNameDef(context: NodeMapContext): ValueName | undefined;

  getRefName(context: NodeMapContext): ValueName[] | ValueName | undefined;
}

export class NodeMapImp implements NodeMap {
  constructor(private nameDef: NodeMap['getNameDef'],
              private refName: NodeMap['getRefName']) {
  }

  public getNameDef(context: NodeMapContext) {
    return this.nameDef(context);
  }

  public getRefName(context: NodeMapContext) {
    return this.refName(context);
  }
}
