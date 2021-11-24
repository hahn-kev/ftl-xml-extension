import {suite, test} from 'mocha';
import {FtlData, XmlTag} from '../../data/ftl-data';
import {expect} from 'chai';

suite('FTL Data', () => {
  test('should not have duplicate names', () => {
    const seenNames = new Set<string>();
    const duplicates: string[] = [];
    for (const tag of FtlData.tags) {
      if (seenNames.has(tag.name)) {
        duplicates.push(tag.name);
        continue;
      }
      seenNames.add(tag.name);
    }
    expect(duplicates).to.be.empty;
  });

  function getAllReferencedValueSetNames(): string[] {
    const globalAttrValueSets = FtlData.globalAttributes?.map((attr) => attr.valueSet) ?? [];
    const tagContentsValueSets = FtlData.tags.map((value: XmlTag) => value.contentsValueSet);
    const tagAttrValueSets = FtlData.tags.flatMap((value) => value.attributes).map((attr) => attr.valueSet);
    return [
      globalAttrValueSets,
      tagContentsValueSets,
      tagAttrValueSets
    ].flat().filter((name?: string): name is string => !!name);
  }

  test('should not have an invalid value set reference', () => {
    const valueSetNames = new Set<string>(FtlData.valueSets?.map((v) => v.name) ?? []);
    const referencedNames = getAllReferencedValueSetNames();
    const notFoundNames = referencedNames.filter((name) => !valueSetNames.has(name));
    expect(notFoundNames).to.be.empty;
  });
});
