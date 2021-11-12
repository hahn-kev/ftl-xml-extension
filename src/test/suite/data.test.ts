import {suite, test} from "mocha";
import {FtlData} from '../../data/ftl-data';
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
});
