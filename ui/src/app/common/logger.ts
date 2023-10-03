export class Logger {

  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  // TODO make more sophisticated
  public log(msg: any): void {
    console.log(`[${this.name}]: ${msg}`)
  }

  // TODO make more sophisticated
  public warn(msg: any): void {
    console.log(`[${this.name}]: ${msg}`)
  }

  // TODO make more sophisticated
  public info(msg: any): void {
    console.log(`[${this.name}]: ${msg}`)
  }

  // TODO make more sophisticated
  public debug(msg: any): void {
    console.log(`[${this.name}]: ${msg}`)
  }

  // TODO make more sophisticated
  public error(msg: any): void {
    console.log(`[${this.name}]: ${msg}`)
  }
}