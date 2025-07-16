interface LogContext {
  endpoint?: string;
  method?: string;
  requestId?: string | null;
  userAgent?: string | null;
  [key: string]: string | number | boolean | null | undefined;
}

interface LogError {
  name: string;
  message: string;
  stack?: string;
}

function createLogEntry(
  level: string,
  message: string,
  error?: LogError,
  context?: LogContext
) {
  return JSON.stringify({
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(error && { error }),
    ...(context && { context }),
  });
}

export const logger = {
  error: (message: string, error?: unknown, context?: LogContext) => {
    const errorInfo: LogError = {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    };

    console.error(createLogEntry("error", message, errorInfo, context));
  },

  warn: (message: string, context?: LogContext) => {
    console.warn(createLogEntry("warn", message, undefined, context));
  },

  info: (message: string, context?: LogContext) => {
    console.info(createLogEntry("info", message, undefined, context));
  },
};
