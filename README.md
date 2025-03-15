# FTL XML

FTL XML is intended to improve the editing experience for any mod dev, please
let me know of any additional features that you would like to have included.

### Smart Rename

![Smart Rename](gifs/rename-example.png)
How to use:  
![Smart Rename gift](gifs/preview-rename.webp)

### Peek Definition/Reference

![Peek def](gifs/peek-def-example.webp)

### Convert to Named Event

![Convert to named event](gifs/preview-extract.webp)

### Preview Animation
includes mode for weapon testing on `weaponAnim`. Check it out.
![Preview Animation](gifs/preview-animation.webp)

## Features

* Slipstream tags, `<mod:findName>` and `<mod-append:*>` along with some minor
  documentation about using them
* Open FTL.dat file (readonly) to inspect the XML that's used by the game.
* Autocomplete, Go to definition and references supported for
    * events
    * ships
    * all blueprints
    * text
    * animations
* Preview animations
* Warnings
    * if trying to load an event that can't be found
    * if trying to load a ship that can't be found
    * if trying to load an autoblueprint that can't be found
    * if trying to load text that can't be found
    * if a tag was not closed properly
    * when a blueprint list references itself
    * when a blueprint can not be found
    * when a blueprint of an invalid type is referenced
    * when animations have configuration issues

### Snippets

![Snippets](gifs/snippet-example.webp)

### Hovering Text Ids

![Hover Text](gifs/hover-text.png)

### Easy Color Editing

![Color Editing](gifs/color-example.webp)

## Known Issues

You must wait for the loading indicator to finish.

## Development

### Publishing a New Version

To publish a new version of the extension:

1. Set the VS Code Personal Access Token as an environment variable:
   ```bash
   # Windows PowerShell
   $env:VSCE_PAT="your_pat_here"
   
   # Windows CMD
   set VSCE_PAT=your_pat_here
   
   # Linux/Mac
   export VSCE_PAT="your_pat_here"
   ```

2. Run the publish command with the desired version bump (patch/minor/major):
   ```bash
   npm run publish patch  # For bug fixes (0.0.X)
   npm run publish minor  # For new features (0.X.0)
   npm run publish major  # For breaking changes (X.0.0)
   ```
Note: The `vsce` tool doesn't support pnpm, so you'll need to use npm for publishing:


This will automatically:
- Bump the version in package.json
- Run tests
- Build the extension
- Publish to the VS Code Marketplace

**Enjoy!**
