import {suite, test} from 'mocha';
import {FtlData, XmlTag} from '../../data/ftl-data';
import {expect} from 'chai';

suite('FTL Data', () => {
    test('should not have duplicate names', () => {
        let seenNames = new Set<string>();
        let duplicates: string[] = [];
        for (let tag of FtlData.tags) {
            if (seenNames.has(tag.name)) {
                duplicates.push(tag.name);
                continue;
            }
            seenNames.add(tag.name);
        }
        expect(duplicates).to.be.empty;
    });

    function getAllReferencedValueSetNames(): string[] {
        let globalAttrValueSets = FtlData.globalAttributes?.map(attr => attr.valueSet) ?? [];
        let tagContentsValueSets = FtlData.tags.map((value: XmlTag) => value.contentsValueSet);
        let tagAttrValueSets = FtlData.tags.flatMap(value => value.attributes).map(attr => attr.valueSet);
        return [
            globalAttrValueSets,
            tagContentsValueSets,
            tagAttrValueSets
        ].flat().filter((name?: string): name is string => !!name);
    }

    test('should not have an invalid value set reference', () => {
        let valueSetNames = new Set<string>(FtlData.valueSets?.map(v => v.name) ?? []);
        let referencedNames = getAllReferencedValueSetNames();
        let notFoundNames = referencedNames.filter(name => !valueSetNames.has(name));
        expect(notFoundNames).to.be.empty;
    });
});
