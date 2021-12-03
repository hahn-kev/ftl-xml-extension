## Going to implement
- auto add newly added png and audio files
- add validation that event text is not whitespace, and not over 440 chars
- add validated based on 
  - https://github.com/kartoFlane/FTL-ErrorChecker/blob/master/database/scripts/xml/check_anim.bsh
  - https://github.com/kartoFlane/FTL-ErrorChecker/blob/master/database/scripts/xml/check_animSheet.bsh
- format support
- allow marking events that are unused as not an error, still show a hint about the issue so it can be undone.
- add snippets for animations
- support reqs, checking and autocomplete
- error if blueprint is defined outside blueprint specific files [autoBlueprints, blueprints, dlcBlueprints and dlcBlueprintsOverwrite]


## Research required
- cache parsed state for workspace
- implement or somehow use existing html query language
