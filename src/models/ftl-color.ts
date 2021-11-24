import {Range} from 'vscode';

export class FtlColor {
  constructor(range: Range, r?: number, g?: number, b?: number, a?: number) {
    this.range = range;
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  range: Range;
  r?: number;
  g?: number;
  b?: number;
  a?: number;

  isValid(): this is { r: number, g: number, b: number } & FtlColor {
    return typeof this.r === 'number'
        && typeof this.g === 'number'
        && typeof this.b === 'number';
  }
}
