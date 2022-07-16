import {FtlXmlParser, ParseContext} from './ftl-xml-parser';
import {findValueSetReferences, ReferenceDeclaration} from '../ref-mappers/node-mapping/declaration-node-map';
import {IValueSet} from 'vscode-html-languageservice';
import {
  AutoRewardLevelsValueSet,
  BoolValueSet,
  RarityValueSet
} from '../data/autocomplete-value-sets';
import {getAttrValueName, getNodeContent, nodeTagEq} from '../helpers';
import {DiagnosticBuilder} from '../diagnostic-builder';
import {ValueName} from '../ref-mappers/value-name';

type Pattern = ReferenceDeclaration & { valueSet: IValueSet };

export class ValueSetParserValidator implements FtlXmlParser {
  constructor() {
    const valueSets: IValueSet[] = [
      AutoRewardLevelsValueSet,
      BoolValueSet,
      RarityValueSet
    ];
    this.patterns = valueSets.flatMap(set => findValueSetReferences(set).map(ref => ({valueSet: set, ...ref})));
  }

  patterns: Pattern[];

  public parseNode(context: ParseContext): void | FtlXmlParser {
    for (const pattern of this.patterns) {
      if (!nodeTagEq(context.node, pattern.tag)) continue;
      switch (pattern.type) {
        case 'contents':
          const contents = getNodeContent(context.node, context.document);
          if (!contents) continue;
          if (!this.isValid(pattern, contents)) {
            context.file.diagnostics.push(DiagnosticBuilder.invalidValue(contents, 'Node'));
          }
          break;
        case 'attr':
          const attrValue = getAttrValueName(context.node, pattern.attr, context.document);
          if (!attrValue) continue;
          if (!this.isValid(pattern, attrValue)) {
            context.file.diagnostics.push(DiagnosticBuilder.invalidValue(attrValue, 'Attribute'));
          }
          break;
      }
    }
  }

  isValid(pattern: Pattern, value: ValueName): boolean {
    return !!pattern.valueSet.values.find(v => v.name === value?.name);
  }
}
