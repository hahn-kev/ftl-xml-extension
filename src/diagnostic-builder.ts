import {Diagnostic, Node} from 'vscode-html-languageservice';
import {toRange} from './helpers';
import {BlueprintListTypeAny} from './data/ftl-data';
import {FtlAnimation} from './models/ftl-animation';
import {FtlAnimationSheet} from './models/ftl-animation-sheet';
import {Range} from 'vscode-languageserver-textdocument';
import {FtlTextDocument} from './models/ftl-text-document';
import {FtlDiagnostic, FtlDiagnosticSeverity} from './models/ftl-diagnostic';
import type {DiagnosticSeverity} from 'vscode-languageserver-types';

export enum FtlErrorCode {
  listTypeMismatch = 'ftl-listTypeMismatch',
  refTypeInvalid = 'ftl-refTypeInvalid',
  refLoop = 'ftl-refLoop',
  unusedRef = 'ftl-unused-ref',
  invalidRefName = 'ftl-invalid-ref-name',
  childNotAllowed = 'ftl-child-not-allowed',
  missingRequiredChild = 'ftl-missing-required-child',
  tagNotClosed = 'ftl-tag-not-closed',
  sheetRefMissing = 'ftl-sheet-ref-missing',
  sheetMissingDimensions = 'ftl-sheet-missing-dimensions',
  sheetDimensionNotWholeNumber = 'ftl-sheet-dimension-not-whole-number',
  animationInvalidDescription = 'ftl-animation-invalid-description',
  animationTooLong = 'ftl-animation-too-long',
  fileNotUsed = 'ftl-file-not-referenced'
}

export class DiagnosticBuilder {
  private static diag(
      range: Range,
      message: string,
      severity: FtlDiagnosticSeverity,
      code: FtlErrorCode): FtlDiagnostic {
    return Diagnostic.create(range, message, severity as DiagnosticSeverity, code);
  }

  static listTypeMisMatch(
      blueprintName: undefined | string,
      type: string,
      listTypeName: string,
      range: Range) {
    const message = `Blueprint '${blueprintName}' is an '${type}' does not match type the list '${listTypeName}'`;
    return this.diag(range, message, FtlDiagnosticSeverity.Warning, FtlErrorCode.listTypeMismatch);
  }

  static listHasRefLoop(range: Range, listName: string, namesInLoop: string[]) {
    return this.diag(
        range,
        `Blueprint List: ${listName} is self referencing, path: ${namesInLoop.join(' -> ')}`,
        FtlDiagnosticSeverity.Error,
        FtlErrorCode.refLoop
    );
  }

  static blueprintRefTypeInvalid(
      range: Range,
      defType: string,
      refName: string,
      refType: string) {
    if (defType == BlueprintListTypeAny) {
      defType = 'Blueprint List';
    }
    return this.diag(range,
        `${refType} can't reference a ${defType}, which is the type of blueprint: '${refName}'`,
        FtlDiagnosticSeverity.Warning,
        FtlErrorCode.refTypeInvalid);
  }

  static refUnused(type: 'Ship' | 'Event', name: string, range: Range) {
    return this.diag(range,
        `${type}: ${name} is not used anywhere, is this a bug?`,
        FtlDiagnosticSeverity.Information,
        FtlErrorCode.unusedRef);
  }

  static invalidRefName(name: string, range: Range, typeName: string) {
    return this.diag(range,
        `Invalid ${typeName} name: '${name}'`,
        FtlDiagnosticSeverity.Warning,
        FtlErrorCode.invalidRefName);
  }

  static childTagNotAllowed(parent: Node, child: Node, document: FtlTextDocument) {
    return this.diag(
        toRange(child.start, child.startTagEnd ?? child.end, document),
        `Tag: ${child.tag} is not allowed in a ${parent.tag}`,
        FtlDiagnosticSeverity.Warning,
        FtlErrorCode.childNotAllowed
    );
  }

  static missingRequiredChild(node: Node, requiredName: string, document: FtlTextDocument) {
    return this.diag(toRange(node.start, node.startTagEnd ?? node.end, document),
        `Tag: ${node.tag} is missing the required child: ${requiredName}`,
        FtlDiagnosticSeverity.Warning, FtlErrorCode.missingRequiredChild
    );
  }

  static tagNotClosed(range: Range, tagName: string) {
    return this.diag(range,
        `Tag '${tagName}' is not properly closed`,
        FtlDiagnosticSeverity.Error,
        FtlErrorCode.tagNotClosed);
  }

  static sheetNameMissing(animation: FtlAnimation) {
    return this.diag(
        animation.range,
        `animation is missing sheet reference`,
        FtlDiagnosticSeverity.Warning, FtlErrorCode.sheetRefMissing);
  }

  static sheetMissingDimensions(sheet: FtlAnimationSheet) {
    return this.diag(sheet.range,
        `sheet is missing one of 'w, h, fw, fh' attributes`,
        FtlDiagnosticSeverity.Error,
        FtlErrorCode.sheetMissingDimensions);
  }

  static sheetDimensionsNotWholeNumber(
      sheet: FtlAnimationSheet,
      direction: 'width' | 'height') {
    const detail = direction === 'width'
        ? `${sheet.width}/${sheet.frameWidth} = ${(sheet.width ?? 0.0) / (sheet.frameWidth ?? 1.0)}`
        : `${sheet.height}/${sheet.frameHeight} = ${(sheet.height ?? 0.0) / (sheet.frameHeight ?? 1.0)}`;
    return this.diag(sheet.range,
        `sheet ${direction} does not divide into a whole number of frames, ${detail}`,
        FtlDiagnosticSeverity.Warning, FtlErrorCode.sheetDimensionNotWholeNumber);
  }

  static animationDescriptionInvalid(animation: FtlAnimation) {
    return this.diag(
        animation.descRange ?? animation.range,
        `animation desc is missing one of 'length, x, y' attributes`,
        FtlDiagnosticSeverity.Error,
        FtlErrorCode.animationInvalidDescription
    );
  }

  static animationTooLong(animation: FtlAnimation, maxFrames: number) {
    const offset = animation.x === 0 ? '' : ' with offset of ' + animation.x;
    return this.diag(animation.descRange ?? animation.range,
        `the animation length of ${animation.length}${offset} is too long for sheet '${animation.sheetName}' with a max frames of ${maxFrames}`,
        FtlDiagnosticSeverity.Warning,
        FtlErrorCode.animationTooLong);
  }

  static fileNotReferenced(firstLine: Range) {
    return this.diag(firstLine,
        `this file is not referenced anywhere`,
        FtlDiagnosticSeverity.Warning,
        FtlErrorCode.fileNotUsed);
  }

  static eventHasRefLoop(range: Range, eventName: string, namesInLoop: string[]) {
    return this.diag(
        range,
        `Event: ${eventName} is self referencing, path: ${namesInLoop.join(' -> ')}`,
        FtlDiagnosticSeverity.Error,
        FtlErrorCode.refLoop
    );
  }
}
