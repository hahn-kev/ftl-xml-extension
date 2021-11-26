import {Validator} from './validator';
import {FtlFile} from '../models/ftl-file';
import {Diagnostic, Uri} from 'vscode';
import {DiagnosticBuilder} from '../diagnostic-builder';

export class SoundFileNameValidator implements Validator {
  validateFile(file: FtlFile, diagnostics: Diagnostic[]): void {
    const soundFiles = file.root.soundFiles;
    for (const sound of file.sounds.defs) {
      if (!sound.soundFilePath || this.hasMatchingFile(soundFiles, sound.soundFilePath)) {
        continue;
      }
      diagnostics.push(DiagnosticBuilder.invalidRefName(sound.soundFilePath, sound.range, 'Sound File'));
    }
  }

  private hasMatchingFile(soundFiles: Uri[], soundFilePath: string) {
    let foundMatchingFile = false;
    for (const soundFile of soundFiles) {
      if (soundFile.path.endsWith(soundFilePath)) {
        foundMatchingFile = true;
        break;
      }
    }
    return foundMatchingFile;
  }
}
