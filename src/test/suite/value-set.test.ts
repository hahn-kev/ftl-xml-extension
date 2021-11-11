import {expect} from "chai";
import {before, suite, test} from "mocha";

import {setup} from '../../setup';
import {
    AugmentNames,
    AutoblueprintNames,
    CrewNames,
    DroneNames,
    EventNamesValueSet,
    ShipNames,
    SystemNames,
    TextIdNames,
    WeaponNames
} from '../../data/autocomplete-value-sets';
import {defaultEvents} from '../../data/default-events';
import {defaultShips} from '../../data/default-ships';
import {defaultAutoBlueprints} from '../../data/default-auto-blueprints';
import {defaultWeaponBlueprints} from '../../data/default-weapon-blueprints';
import {defaultDrones} from '../../data/default-drones';
import {defaultCrew} from '../../data/default-crew';
import {defaultAugments} from '../../data/default-augments';
import {defaultSystems} from '../../data/default-systems';

suite('Value Set', () => {

    before(async function () {
        this.timeout('30s');
        let {ftlParser} = setup();
        await ftlParser.parseCurrentWorkspace('mv');
    });

    test('events value set', () => {
        expect(EventNamesValueSet.values.length).to.gt(defaultEvents.length + 100);
    });

    test('ships value set', () => {
        expect(ShipNames.values.length).to.gt(defaultShips.length + 100);
    });

    test('text value set', () => {
        expect(TextIdNames.values.length).to.gt(100);
    });

    test('auto blueprints value set', () => {
        expect(AutoblueprintNames.values.length).to.gt(defaultAutoBlueprints.length + 100);
    });

    test('weapons value set', () => {
        expect(WeaponNames.values.length).to.gt(defaultWeaponBlueprints.length + 100);
    });

    test('drone value set', () => {
        expect(DroneNames.values.length).to.gt(defaultDrones.length + 100);
    });

    test('crew value set', () => {
        expect(CrewNames.values.length).to.gt(defaultCrew.length + 100);
    });

    test('augment value set', () => {
        expect(AugmentNames.values.length).to.gt(defaultAugments.length + 100);
    });

    test('system value set', () => {
        expect(SystemNames.values.length).to.gte(defaultSystems.length);
    });
});
