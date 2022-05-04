import {suite, test} from 'mocha';
import {TestHelpers} from './test-helpers';
import {expect} from 'chai';
import {FtlErrorCode} from '../../diagnostic-builder';

suite('Ftl Weapons', () => {
//   test('choice should missing required children', () => {
//     const services = TestHelpers.testSetup();
//     const document = TestHelpers.testTextDocument(
//         `
// <weaponBlueprint></weaponBlueprint>
// `);
//     const file = services.parser.parseDocument(document);
//     const requiredChildrenErrors = file.diagnostics.filter(d => d.code == FtlErrorCode.missingRequiredChild);
//     expect(requiredChildrenErrors).to.not.be.empty;
//   });

  test('choice should not show missing required children for drone weapons', () => {
    const services = TestHelpers.testSetup();
    const document = TestHelpers.testTextDocument(
        `
<droneBlueprint>
<!--real weapon name used here to prevent that from being an error-->
    <weaponBlueprint>LASER_BURST_1</weaponBlueprint>
</droneBlueprint>
`);
    const file = services.parser.parseDocument(document);
    const requiredChildrenErrors = file.diagnostics.filter(d => d.code == FtlErrorCode.missingRequiredChild);
    expect(requiredChildrenErrors).to.be.empty;
  });
});
