import {Validator} from './validator';
import {FtlFile} from '../models/ftl-file';
import {DiagnosticBuilder} from '../diagnostic-builder';
import {defaultImgFiles} from '../data/default-ftl-data/default-img-files';
import {FtlDiagnostic} from '../models/ftl-diagnostic';
import {Range} from 'vscode-languageserver-textdocument';
import {FtlResourceFile} from '../models/ftl-resource-file';

export class ImgFileNameValidator implements Validator {
  defaultImgFilesSet = new Set(defaultImgFiles);

  validateFile(file: FtlFile, diagnostics: FtlDiagnostic[]): void {
    diagnostics.push(
        ...this.validateDefs(file.root.imgFiles,
            file.animationSheets.defs,
            (v) => ({modPath: v.sheetFilePath, range: v.range}),
            'Image File'),
        ...this.validateDefs(file.root.imgFiles,
            file.weaponAnimations.defs,
            (v) => ({modPath: v.chargeImagePath, range: v.chargeImageRange}),
            'Image File'),
        ...this.validateDefs(file.root.imgFiles,
            file.imageLists.defs.flatMap((list) => list.imgList),
            (v) => ({modPath: v.path, range: v.range}),
            'Image File')
    );
    diagnostics.push(
        ...this.validateDefs(file.root.shipIconFiles,
            file.shipIcons.defs,
            (v) => ({modPath: v.name, range: v.range}),
            'Ship Icon')
    );
  }

  validateDefs<T, T_FILES extends FtlResourceFile>(
      files: T_FILES[],
      defs: T[],
      selectInfo: (v: T) => ({ modPath: string | undefined, range: Range }),
      typeName: string): FtlDiagnostic[] {
    return defs.map((value) => {
      const {modPath, range} = selectInfo(value);
      if (!modPath || this.defaultImgFilesSet.has(modPath) || files.some((file) => file.modPath == modPath)) return;
      return DiagnosticBuilder.invalidRefName(modPath, range, typeName);
    }).filter((d): d is FtlDiagnostic => !!d);
  }
}
