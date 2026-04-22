export enum LogLevel {
  TRACE = 'TRACE',
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

type LogEntry = {
  level: LogLevel;
  message: string;
};

type LogListener = (entry: LogEntry) => void;

export class Log {
  private static readonly listeners = new Set<LogListener>();

  static subscribe(listener: LogListener): () => void {
    Log.listeners.add(listener);
    return () => Log.listeners.delete(listener);
  }

  constructor(private readonly context: string) {}

  private write(level: LogLevel, message: unknown): void {
    const rendered = typeof message === 'string' ? message : JSON.stringify(message);
    const entry = {
      level,
      message: `[${this.context}] ${rendered}`,
    };

    for (const listener of Log.listeners) {
      listener(entry);
    }

    const line = `${entry.level}: ${entry.message}`;
    switch (level) {
      case LogLevel.TRACE:
      case LogLevel.DEBUG:
        console.debug(line);
        break;
      case LogLevel.INFO:
        console.info(line);
        break;
      case LogLevel.WARN:
        console.warn(line);
        break;
      case LogLevel.ERROR:
        console.error(line);
        break;
    }
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
