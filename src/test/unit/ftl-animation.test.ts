import { suite, test } from 'mocha';
import { TestHelpers } from './test-helpers';
import { expect } from 'chai';
import { FtlErrorCode } from '../../diagnostic-builder';
import { RefNameValidator } from '../../validators/ref-name-validator';
import { FtlDiagnostic } from '../../models/ftl-diagnostic';

suite('Ftl Animations', () => {
    test('choice should not show missing required children for drone weapons', () => {
        const services = TestHelpers.testSetup();
        const document = TestHelpers.testTextDocument(
            `
<animSheet name="test_sheet_name"/>
<anim>
        <sheet>test_sheet_name</sheet>
</anim>
`);
        const file = services.parser.parseDocument(document);
        const diagnostics: FtlDiagnostic[] = [];
        new RefNameValidator(services.mappers.list, services.mappers.blueprintMapper).validateFile(file, diagnostics);
        expect(diagnostics).to.be.empty;
    });
});
