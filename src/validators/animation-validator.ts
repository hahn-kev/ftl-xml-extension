import {Validator} from './validator';
import {FtlFile} from '../models/ftl-file';
import {Diagnostic} from 'vscode';
import {Mappers} from '../ref-mappers/mappers';
import {RefMapper} from '../ref-mappers/ref-mapper';
import {FtlAnimationSheet} from '../models/ftl-animation-sheet';
import {DiagnosticBuilder} from '../diagnostic-builder';
import {FtlAnimation} from '../models/ftl-animation';

export class AnimationValidator implements Validator {
  private animationSheetMapper: RefMapper<FtlAnimationSheet>;

  constructor(mappers: Mappers) {
    this.animationSheetMapper = mappers.animationSheetMapper;
  }

  public validateFile(file: FtlFile, diagnostics: Diagnostic[]): void {
    for (const sheet of file.animationSheets.defs) {
      if (!this.isSheetValid(sheet)) {
        diagnostics.push(DiagnosticBuilder.sheetMissingDimensions(sheet));
        continue;
      }
      if (sheet.height % sheet.frameHeight !== 0) {
        diagnostics.push(DiagnosticBuilder.sheetDimensionsNotWholeNumber(sheet, 'height'));
      }
      if (sheet.width % sheet.frameWidth !== 0) {
        diagnostics.push(DiagnosticBuilder.sheetDimensionsNotWholeNumber(sheet, 'width'));
      }
    }
    for (const animation of file.animations.defs) {
      this.validateAnimation(animation, diagnostics);
    }
    for (const weaponAnimation of file.weaponAnimations.defs) {
      this.validateAnimation(weaponAnimation, diagnostics);
    }
  }

  isSheetValid(sheet: FtlAnimationSheet): sheet is FtlAnimationSheet & {
    width: number,
    height: number,
    frameWidth: number,
    frameHeight: number,
  } {
    return sheet.width !== undefined
        && sheet.height !== undefined
        && sheet.frameWidth !== undefined
        && sheet.frameHeight !== undefined;
  }

  private validateAnimation(animation: FtlAnimation, diagnostics: Diagnostic[]) {
    if (!animation.sheetName) {
      diagnostics.push(DiagnosticBuilder.sheetNameMissing(animation));
      return;
    }
    const sheet = this.animationSheetMapper.defs.get(animation.sheetName);

    // don't need to handle null sheet here it's handled by the ref mapper
    // don't need to handle invalid sheet as it's per sheet above
    if (!sheet || !this.isSheetValid(sheet)) return;

    if (animation.length === undefined || animation.x === undefined || animation.y === undefined) {
      diagnostics.push(DiagnosticBuilder.animationDescriptionInvalid(animation));
      return;
    }


    const sheetRows = sheet.height / sheet.frameHeight;
    const sheetColumns = sheet.width / sheet.frameWidth;
    const maxFrames = sheetRows * sheetColumns;
    if (sheetColumns < (animation.length + animation.x)) {
      diagnostics.push(DiagnosticBuilder.animationTooLong(animation, sheetColumns));
    }
    // if (animation.y >= sheetRows) {
    //
    // }
  }
}
