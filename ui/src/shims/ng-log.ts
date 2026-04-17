import { Subject } from 'rxjs';

export enum LogLevel {
  TRACE,
  DEBUG,
  INFO,
  WARN,
  ERROR,
}

type LogEntry = {
  level: LogLevel;
  message: string;
};

export class Log {
  static readonly $logEntry = new Subject<LogEntry>();

  constructor(private readonly context: string) {}

  private write(level: LogLevel, message: unknown): void {
    const rendered = typeof message === 'string' ? message : JSON.stringify(message);
    Log.$logEntry.next({
      level,
      message: `[${this.context}] ${rendered}`,
    });
  }

  trace(message: unknown): void {
    this.write(LogLevel.TRACE, message);
  }

  debug(message: unknown): void {
    this.write(LogLevel.DEBUG, message);
  }

  info(message: unknown): void {
    this.write(LogLevel.INFO, message);
  }

  warn(message: unknown): void {
    this.write(LogLevel.WARN, message);
  }

  error(message: unknown): void {
    this.write(LogLevel.ERROR, message);
  }
}
