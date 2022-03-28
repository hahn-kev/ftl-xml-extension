## Going to implement
- narrow range for attribute refs
- make sure projectile tag contents is a ref to an animation
- look into removing generic text complete from ftl files
- support refs from removeItem
- enable required children again once we can fix weapon issues
- make sure unlock custom ship only shows player ships (defined in hyper space under ships>ship) instead of all blueprints
- add missing refs for:
    - ship blueprint elements: cloak, shield images
    - sector trackList track music
    
- improve dat fs performance, don't read data into file until requested
- add validation that event text is not whitespace, and not over 440 chars
- format support
- allow marking events that are unused as not an error, still show a hint about the issue so it can be undone.
- add snippets for animations
- error if blueprint is defined outside blueprint specific files [autoBlueprints, blueprints, dlcBlueprints and dlcBlueprintsOverwrite]


## Research required
- cache parsed state for workspace
- implement or somehow use existing html query language
