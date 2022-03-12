import {Validator} from './validator';
import {FtlFile} from '../models/ftl-file';
import {DiagnosticBuilder} from '../diagnostic-builder';
import {defaultImgFiles} from '../data/default-ftl-data/default-img-files';
import {FtlRoot} from '../models/ftl-root';
import {FtlDiagnostic} from '../models/ftl-diagnostic';
import {Range} from 'vscode-languageserver-textdocument';

export class ImgFileNameValidator implements Validator {
  defaultImgFilesSet = new Set(defaultImgFiles);

  validateFile(file: FtlFile, diagnostics: FtlDiagnostic[]): void {
    diagnostics.push(
        ...this.validateDefs(file.root, file.animationSheets.defs, (v) => ({path: v.sheetFilePath, range: v.range})),
        ...this.validateDefs(file.root,
            file.weaponAnimations.defs,
            (v) => ({path: v.chargeImagePath, range: v.chargeImageRange})),
        ...this.validateDefs(file.root,
            file.imageLists.defs.flatMap((list) => list.imgList),
            (v) => ({path: v.path, range: v.range}))
    );
  }

  validateDefs<T>(
      root: FtlRoot,
      defs: T[],
      selectInfo: (v: T) => ({ path: string | undefined, range: Range })): FtlDiagnostic[] {
    return defs.map((value) => {
      const {path, range} = selectInfo(value);
      if (!path || this.defaultImgFilesSet.has(path) || root.findMatchingImg(path)) return;
      return DiagnosticBuilder.invalidRefName(path, range, 'Image File');
    }).filter((d): d is FtlDiagnostic => !!d);
  }
}
