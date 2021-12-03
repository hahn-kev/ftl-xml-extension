import {FtlDatFs} from './ftl-dat-fs';
import {commands, window, workspace} from 'vscode';
import {disposable} from '../setup';
import {FtlDatCache} from './ftl-dat-cache';

export function setupFtlDataProvider(ftlDatCache: FtlDatCache) {
  const subs: disposable[] = [];
  const ftlDatFS = new FtlDatFs(ftlDatCache);
  subs.push(commands.registerCommand('ftl-xml.add-ftl-dat', async (_) => {
    const files = await window.showOpenDialog({filters: {'ftl dat': ['dat']}, canSelectMany: false});
    if (!files) return;
    const datFile = files[0];
    workspace.updateWorkspaceFolders(0, 0, {uri: datFile.with({scheme: FtlDatFs.scheme}), name: 'FTL Dat'});
  }));
  subs.push(workspace.registerFileSystemProvider(FtlDatFs.scheme, ftlDatFS, {isCaseSensitive: true, isReadonly: true}));
  return subs;
}
