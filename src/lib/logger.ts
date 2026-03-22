type LogLevel = "info" | "warn" | "error";

function formatLog(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  return JSON.stringify(entry);
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    console.log(formatLog("info", message, meta));
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    console.warn(formatLog("warn", message, meta));
  },
  error: (message: string, meta?: Record<string, unknown>) => {
    console.error(formatLog("error", message, meta));
  },
};
