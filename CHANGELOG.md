# Change Log

All notable changes to the "ftlXml" extension will be documented in this file.

## 0.8.11

- support blueprint rarity lists
- support custom stores autocomplete and id checks

## 0.8.10

- fix minor issue with animation sheets not in a FTL tag

## 0.8.9

- prevent duplicate warnings from getting created in some cases
- add output window and some logging to diagnose issues

## 0.8.8

- fix hover text for weapon
- fix highlight offset for sounds
- fix animation sheet references in race
- support mp3 files as sounds

## 0.8.7

- support ship system images, warnings, previews autocomplete goto etc...

## 0.8.6

- add documentation for mod tags
- Show documentation for both mod tags and ftl tags when merged
- mod find tags now have autocomplete of the type attribute
- adjust how invalid ref warning is displayed to not include single quotes
- provide fallback for find files when running on web
- custom sectors are supported
- `<choice req="SEC FINAL"/>` and other custom sectors are now supported
- custom store blueprints now work

## 0.8.5

- Add priorityEvent support
- `<removeItem>HIDDEN AUG</removeItem>` now works correctly
- refresh warnings for all open documents on edit
- refresh all warnings when file saved
- purge cache when a file is removed/renamed

## 0.8.4

- Fix tag names not matching properly when using mod tags

## 0.8.3

- add artillery as a weapon
- fix some ship reference issues
- removed event button warning until we can get proper support
- fixed invalid warnings when restoring an event alias

## 0.8.2

- Fix bug where variables declared in `hyperspace.xml.append` wouldn't get detected properly
- fixed up how reqs and removeItem work so they show references better and don't have errors
- Fixed list type missmatch errors

## 0.8.1

- Added progress reporting when parsing
- add custom auto reward support

## 0.8.0

- Add new 'Convert to Named Event' quick fix, use by clicking the light bulb
  when an event inside a choice is selected

## 0.7.3

- add error if event is missing `<text>` or choice is missing `<text>`
  or `<event>`

## 0.7.2

- Implement warnings for invalid auto reward values

## 0.7.1

- Fix goto when the reference is not selected on a line
- Fix the location of a warning for a missing animation sheet file
- Allow marking an event or ship as unused to prevent warnings, include quick
  fix

## 0.7.0

- **Introduce Smart Rename feature**
- Add more ship blueprint references, fix some other missing references.
- Simple word based suggestions disabled by default

## 0.6.2

- fix issue with inline references for blueprints

## 0.6.1

- Add support for <shipIcon>
- Add support for references and animation preview button to show inline

## 0.6.0

- Add support and documentaion for slipstream mod elements like `<mod:findName>`
  and `<mod-append:*>`
- removed required children error until we can improve it
- fixed event loop error if an event was defined twice, once in an unreferenced
  file
- prevent unreferenced files from showing up in find references

## 0.5.4

- Show error if there's an event loop which would cause FTL to crash

## 0.5.3

- Show event text and weapon name in autocomplete

## 0.5.2

- Add support for hyperspace.xml.append files
- Support append event files getting included as references

## 0.5.1

- show a warning on a file if it's not referenced
- hide all warnings and errors on files not referenced
- add a bunch of documentation for event elements uinqiue to hyperspace
- added new event refs: eventAlias, deathEvent revisitEvent queueEvent
  renameBeacon
- added new image list refs: win[creditsBackground] and changeBackground
- added new crew refs: transformRace
- added support for variables, custom reqs, and choice[req] reference support
  and checks

## 0.5.0

- **Major performance improvement 4x faster in Multiverse, down from 20+ seconds
  to 5**🥳
- shipBlueprint [unlock] id text supported
- add crewCount [class] auto complete
- add weaponList [load] auto complete
- support hiddenAug and aug refs

## 0.4.3

- Auto parse files when added, including png and audio files
- preview animations

## 0.4.2

- Add animation validator to check the frames used vs defined
- fix bug where you couldn't add a folder to the workspace when an ftl.dat was
  opened already
- allow hovering over an image path to see a preview of it

## 0.4.1

- Add default sound files from base ftl
- Add support for imageLists
- implemented the ability to load the ftl.dat file directly

## 0.4.0

- Add support for completing and validating sound file paths
- add flavorType[id] is text ref
- Add support for completing, validating, go to for animations
- Add support for img paths for animations

## 0.3.6

- Remove 'min_level' as an attribute from 'choice'
- fix bug with 'damage', system can be 'room' or 'random'
- show info when an event is not used anywhere
- add bossShip (hs) as a ship ref
- add escape, quest, triggeredEvent, nebulaEvent, jumpEvent, exitBeacon,
  rebelBeacon as event refs

## 0.3.5

- Add parse command to allow running it manually
- Add color picker support

## 0.3.4

- Fix issue with sound tag not having autocomplete

## 0.3.3

- Fix issue with status/damage/upgrade system auto complete
- When hovering over a text id show the actual text
- Make sure text defs come from primary translation
- Add support for sound refs

## 0.3.2

- Add snippet for auto reward
- Add tag data for auto reward
- fix issue with weaponBlueprint tags required error when in drone

## 0.3.1

- Add more text id bindings for weapon text
- add ghost and traitor as default crew names
- add required elements for weaponBlueprints
- add rarity autocomplete

## 0.3.0

- Add default text ids from misc, sectorname and tooltips
- fix hidden arg issues
- remove duplicate elements in autocomplete
- allow a blueprint list to contain anything and don't warn about type
- fix an issue where blueprint loops would break the parser
- when a workspace folder is added or removed update the data

## 0.2.2

- Update readme

## 0.2.1

- Include patch notes for 0.2.0

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

## 0.1.0

- Add support for autoblueprints
- Add support for text id and refs
- Add support for ship destroyed and crewDead event refs

## 0.0.2

- Enable web support

## 0.0.1

- Initial release
