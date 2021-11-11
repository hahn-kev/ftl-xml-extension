import {expect} from "chai";
import { performance } from 'perf_hooks';
import {window} from 'vscode';
import {setup} from '../../setup';

suite('Extension Test Suite', () => {
    window.showInformationMessage('Start all tests.');

    async function parseTest(folderName: string) {
        let {ftlParser} = setup();
        console.log('begin parsing ' + folderName);
        let startTime = performance.now();
        console.time('parse ' + folderName);
        await ftlParser.parseCurrentWorkspace(folderName);
        console.timeEnd('parse ' + folderName);
        let endTime = performance.now();
        return endTime - startTime;
    }

    test('Loading MV test', async function () {
        // this.skip();
        this.timeout('500s');

        /*
            parse files: 12.146s
            update data: 69.797ms
            parse mv: 12.373s
        **/
        let execution = await parseTest('mv');
        expect(execution).to.lt(13000);
    });
    test('Loading base test', async function () {
        this.timeout('500s');

        let execution = await parseTest('ftl-base');
        expect(execution).to.lt(6500);
    });
});
