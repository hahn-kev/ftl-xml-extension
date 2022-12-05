
export interface IFtlOutputChannel {

  /**
   * The human-readable name of this output channel.
   */
  readonly name: string;

  /**
   * Append the given value to the channel.
   *
   * @param value A string, falsy values will not be printed.
   */
  append(value: string): void;

  /**
   * Append the given value and a line feed character
   * to the channel.
   *
   * @param value A string, falsy values will be printed.
   */
  appendLine(value: string): void;

  /**
   * Removes all output from the channel.
   */
  clear(): void;

}

export class FtlOutputChannel implements IFtlOutputChannel{

  constructor(private channel: IFtlOutputChannel) {
  }

  public readonly name = this.channel.name;

  public append(value: string): void {
    this.channel.append(value);
  }

  public appendLine(value: string): void {
    this.channel.appendLine(value);
  }

  public clear(): void {
    this.channel.clear();
  }

  timers = new Map<string, number>();
  public time(name: string) {
    this.timers.set(name, Date.now());
  }

  public timeEnd(name: string) {
    const startTime = this.timers.get(name);
    if (!startTime) return

    const endTime = Date.now();
    let totalTime = endTime - startTime;

    let timeUnit = 'ms';
    if (totalTime > 1000) {
      totalTime = totalTime / 1000;
      timeUnit = 's';
    }
    this.appendLine(`${name}: ${this.formatNumber(totalTime)}${timeUnit}`)
    this.timers.delete(name);
  }
  static numberFormat = new Intl.NumberFormat();
  public formatNumber(value: number) {
    return FtlOutputChannel.numberFormat.format(value);
  }
}
