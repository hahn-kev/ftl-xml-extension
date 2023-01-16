import {FtlUri} from '../models/ftl-text-document';

export type AnimationMessage = AnimSheet | WeaponAnimationSheet;


interface AnimationSheetBase {
  type?: string;
  debug?: boolean;
  fw: number | undefined;
  img: string;
  fh: number | undefined;
  x: number | undefined;
  width: number | undefined;
  length: number | undefined;
  y: number | undefined;
  height: number | undefined;
}

interface AnimSheet extends AnimationSheetBase {
  type: 'anim';
  time: number | undefined;
}

export interface WeaponAnimationSheet extends AnimationSheetBase {
  type: 'weapon';
  chargedFrame: number | undefined;
  fireFrame: number | undefined;
  firePoint: { x: number, y: number } | undefined;
  mountPoint: { x: number, y: number } | undefined;
}
