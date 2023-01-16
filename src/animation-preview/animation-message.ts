export type AnimationMessage = {
  debug?: boolean;
} & AnimationSheetBase;



interface AnimationSheetBase {
  fw?: number;
  img: string;
  fh?: number;
  x?: number;
  width?: number;
  length?: number;
  y?: number;
  time?: number;
  height?: number;
}

interface WeaponAnimationSheet extends AnimationSheetBase{
  chargedFrame?: number;
  fireFrame?: number;
  firePoint?: {x: number, y: number}
  mountPoint?: {x: number, y: number}
}
