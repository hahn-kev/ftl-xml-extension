# Change Log

All notable changes to the "ftlXml" extension will be documented in this file.

## 0.0.1

- Initial release

## 0.0.2

- Enable web support

## 0.1.0

- Add support for autoblueprints
- Add support for text id and refs
- Add support for ship destroyed and crewDead event refs

## 0.2.0

- Add support for weapon blueprints
- Add support for drone blueprints
- Validate that a referenced blueprint is of a valid type
- Improve parse performance
- Add support for blueprint lists
  - validate list types
  - validate reference loops
- Fix bug with jumping to reference or def based on position of cursor
- Add support for augments
- Add support for crew
- Add support for systems
- Add support for required element children

## 0.2.1 
- Include patch notes for 0.2.0

## 0.2.2
- Update readme

## 0.3.0
- Add default text ids from misc, sectorname and tooltips
- fix hidden arg issues
- remove duplicate elements in autocomplete
- allow a blueprint list to contain anything and don't warn about type
- fix an issue where blueprint loops would break the parser
- when a workspace folder is added or removed update the data

## 0.3.1
- Add more text id bindings for weapon text
- add ghost and traitor as default crew names
- add required elements for weaponBlueprints
- add rarity autocomplete

## 0.3.2
- Add snippet for auto reward
- Add tag data for auto reward
- fix issue with weaponBlueprint tags required error when in drone

## 0.3.3
- Fix issue with status/damage/upgrade system auto complete
- When hovering over a text id show the actual text
- Make sure text defs come from primary translation
- Add support for sound refs

## 0.3.4
- Fix issue with sound tag not having autocomplete

## 0.3.5
- Add parse command to allow running it manually
- Add color picker support

## 0.3.6
- Remove 'min_level' as an attribute from 'choice'
- fix bug with 'damage', system can be 'room' or 'random'
