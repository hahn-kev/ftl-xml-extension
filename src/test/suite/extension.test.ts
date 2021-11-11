import {expect} from "chai";

import { performance } from 'perf_hooks';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import {window} from 'vscode';
import {setup} from '../../setup';
// import * as myExtension from '../../extension';

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
        this.skip();
        this.timeout('500s');

        await parseTest('mv');
    });
    test('Loading base test', async function () {
        this.timeout('500s');

        let execution = await parseTest('ftl-base');
        expect(execution).to.lt(6500);
    });
});
