## Want to implement

- req can be `req="SEC Final"` where Final is a sector name
- add documentation for slipstream tags, `<mod-append:event>` should show docs for both mod-apend and event
- stores can have custom stock and need to reference blueprints
- show warning for deeply nested lists, 3rd list deep will be ignored
- tutorial xml has custom text id stuff, example `<default id="textID">` and `<PC id="id">`


- narrow range for attribute refs, for example `name= "value"` has the range set incorrectly
- make sure projectile tag contents is a ref to an animation
- enable required children again once we can fix weapon issues
- make sure unlock custom ship only shows player ships (defined in hyper space
  under ships>ship) instead of all blueprints
- add missing refs for:
    - ship blueprint elements: cloak, shield images
    - sector trackList track music
- add validation that event text is not whitespace, and not over 440 chars
- format support
- add snippets for animations
- error if blueprint is defined outside blueprint specific
  files [autoBlueprints, blueprints, dlcBlueprints and dlcBlueprintsOverwrite]

## Research required

- cache parsed state for workspace
- implement or somehow use existing html query language
