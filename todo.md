## Going to implement
- make sure projectile tag contents is a ref to an animation
- support refs from removeItem
- add missing refs for:
    - ship blueprint elements: cloak, shield images
    - element: unlockShip body
    - sector trackList track music
    
- improve dat fs performance, don't read data into file until requested
- add validation that event text is not whitespace, and not over 440 chars
- format support
- allow marking events that are unused as not an error, still show a hint about the issue so it can be undone.
- add snippets for animations
- support reqs, checking and autocomplete
- add customStore support
- error if blueprint is defined outside blueprint specific files [autoBlueprints, blueprints, dlcBlueprints and dlcBlueprintsOverwrite]


## Research required
- cache parsed state for workspace
- implement or somehow use existing html query language
