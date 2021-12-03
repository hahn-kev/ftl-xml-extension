import {Validator} from './validator';
import {FtlFile} from '../models/ftl-file';
import {Diagnostic, Range} from 'vscode';
import {DiagnosticBuilder} from '../diagnostic-builder';
import {defaultImgFiles} from '../data/default-img-files';
import {FtlRoot} from '../models/ftl-root';

export class ImgFileNameValidator implements Validator {
  defaultImgFilesSet = new Set(defaultImgFiles);
  validateFile(file: FtlFile, diagnostics: Diagnostic[]): void {
    diagnostics.push(...file.animationSheets.defs
        .map((sheet) => this.validatePath(sheet.sheetFilePath, sheet.range, file.root))
        .filter((d): d is Diagnostic => !!d));
    diagnostics.push(...file.weaponAnimations.defs
        .map((weaponAnim) => this.validatePath(weaponAnim.chargeImagePath, weaponAnim.chargeImageRange, file.root))
        .filter((d): d is Diagnostic => !!d));
    diagnostics.push(...file.imageLists.defs.flatMap((list) => list.imgList)
        .map((img) => this.validatePath(img.path, img.range, file.root))
        .filter((d): d is Diagnostic => !!d));
  }

  validatePath(filePath: string | undefined, range: Range, root: FtlRoot) {
    if (!filePath || this.defaultImgFilesSet.has(filePath) || root.findMatchingImg(filePath)) return;
    return DiagnosticBuilder.invalidRefName(filePath, range, 'Image File');
  }
}
