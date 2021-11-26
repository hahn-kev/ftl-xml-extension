import {Validator} from './validator';
import {FtlFile} from '../models/ftl-file';
import {Diagnostic} from 'vscode';
import {DiagnosticBuilder} from '../diagnostic-builder';
import {SoundFile} from '../models/sound-file';

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

  private hasMatchingFile(soundFiles: SoundFile[], soundFilePath: string) {
    for (const soundFile of soundFiles) {
      if (soundFile.matches(soundFilePath)) {
        return true;
      }
    }
    return false;
  }
}
