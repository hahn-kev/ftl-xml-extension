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

**Enjoy!**
