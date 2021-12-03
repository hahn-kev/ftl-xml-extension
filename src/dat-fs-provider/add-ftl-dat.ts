import {FtlDatFs} from './ftl-dat-fs';
import {window, workspace} from 'vscode';

export async function addFtlDat() {
  const files = await window.showOpenDialog({filters: {'ftl dat': ['dat']}, canSelectMany: false});
  if (!files) return;
  const datFile = files[0];
  workspace.updateWorkspaceFolders(
      0,
      0,
      {uri: datFile.with({scheme: FtlDatFs.scheme}), name: 'FTL Dat'}
  );
}
