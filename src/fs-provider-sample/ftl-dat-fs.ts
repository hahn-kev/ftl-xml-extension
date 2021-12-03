/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as vscode from 'vscode';
import {FtlDatCache} from './ftl-dat-cache';
import {File} from './file';
import {Directory} from './directory';
import {FtlDatFile} from './ftl-dat-file';

export type Entry = File | Directory;

export class FtlDatFs implements vscode.FileSystemProvider {
  constructor(private ftlDatCache: FtlDatCache) {

  }

  public static readonly scheme = 'ftl-dat';

  stat(uri: vscode.Uri): vscode.FileStat {
    return this._lookup(uri, this.ftlDatCache.getDatFile(uri), false);
  }

  readDirectory(uri: vscode.Uri): [string, vscode.FileType][] {
    const entry = this._lookupAsDirectory(uri, this.ftlDatCache.getDatFile(uri), false);
    const result: [string, vscode.FileType][] = [];
    for (const [name, child] of entry.entries) {
      result.push([name, child.type]);
    }
    return result;
  }

  // --- manage file contents

  readFile(uri: vscode.Uri): Uint8Array {
    const data = this._lookupAsFile(uri, this.ftlDatCache.getDatFile(uri), false).data;
    if (data) {
      return data;
    }
    throw vscode.FileSystemError.FileNotFound();
  }

  writeFile(uri: vscode.Uri, content: Uint8Array, options: { create: boolean, overwrite: boolean }): void {
    throw new Error('not supported');
  }

  // --- manage files/folders

  rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean }): void {
    throw new Error('not supported');
  }

  delete(uri: vscode.Uri): void {
    throw new Error('not supported');
  }

  createDirectory(uri: vscode.Uri): void {
    throw new Error('not supported');
  }

  // --- lookup

  private _lookup(uri: vscode.Uri, root: Directory, silent: false): Entry;
  private _lookup(uri: vscode.Uri, root: Directory, silent: boolean): Entry | undefined;
  private _lookup(uri: vscode.Uri, root: Directory, silent: boolean): Entry | undefined {
    const parts = FtlDatFile.relativeToDat(uri).split('/');
    let entry: Entry = root;
    for (const part of parts) {
      if (!part) {
        continue;
      }
      let child: Entry | undefined;
      if (entry instanceof Directory) {
        child = entry.entries.get(part);
      }
      if (!child) {
        if (!silent) {
          throw vscode.FileSystemError.FileNotFound(uri);
        } else {
          return undefined;
        }
      }
      entry = child;
    }
    return entry;
  }

  private _lookupAsDirectory(uri: vscode.Uri, root: Directory, silent: boolean): Directory {
    const entry = this._lookup(uri, root, silent);
    if (entry instanceof Directory) {
      return entry;
    }
    throw vscode.FileSystemError.FileNotADirectory(uri);
  }

  private _lookupAsFile(uri: vscode.Uri, root: Directory, silent: boolean): File {
    const entry = this._lookup(uri, root, silent);
    if (entry instanceof File) {
      return entry;
    }
    throw vscode.FileSystemError.FileIsADirectory(uri);
  }

  // --- manage file events

  private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();

  readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._emitter.event;

  watch(_resource: vscode.Uri): vscode.Disposable {
    // ignore, fires for all changes...
    return new vscode.Disposable(() => ({}));
  }
}
