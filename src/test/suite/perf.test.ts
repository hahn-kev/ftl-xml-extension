import {expect} from 'chai';
import {performance} from 'perf_hooks';
import {suite, test} from 'mocha';
import {setup} from '../../setup';

suite('Performance', () => {
  async function parseTest(folderName: string) {
    const {workspaceParser} = setup();
    console.log('begin parsing ' + folderName);
    const startTime = performance.now();
    console.time('parse ' + folderName);
    await workspaceParser.parseWorkspace(folderName);
    console.timeEnd('parse ' + folderName);
    const endTime = performance.now();
    return endTime - startTime;
  }

  test('Loading MV test', async function() {
    // eslint-disable-next-line @typescript-eslint/no-invalid-this
    this.timeout('50s');

    /*
        parse files: 12.146s
        update data: 69.797ms
        parse mv: 12.373s
    **/
    const execution = await parseTest('mv');
    expect(execution).to.lt(13000);
  });
  test('Loading base test', async function() {
    // eslint-disable-next-line @typescript-eslint/no-invalid-this
    this.timeout('50s');

    const execution = await parseTest('ftl-base');
    expect(execution).to.lt(6500);
  });
});
