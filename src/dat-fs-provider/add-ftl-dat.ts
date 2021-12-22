import {FtlDatFs} from './ftl-dat-fs';
import {window, workspace} from 'vscode';

export async function addFtlDat() {
  const files = await window.showOpenDialog({filters: {'ftl dat': ['dat']}, canSelectMany: false});
  if (!files) return;
  const datFile = files[0];
  workspace.updateWorkspaceFolders(
      // add the dat file as the last workspace folder
      // this is because vscode uses the schema of the first folder
      // to determine which file picker to use when adding
      // folders to the workspace
      workspace.workspaceFolders?.length ?? 0,
      0,
      {uri: datFile.with({scheme: FtlDatFs.scheme}), name: 'FTL Dat'}
  );
}
