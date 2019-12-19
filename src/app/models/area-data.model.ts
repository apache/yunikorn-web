export class AreaDataItem {
  t: Date;
  y: number;

  constructor(value: number, time: Date) {
    this.y = value;
    this.t = time;
  }
}
