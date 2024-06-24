/**
 * If extension is in development mode, print the log output on the screen
 */
export function interceptLogs(
  callback: (type: 'log' | 'warn' | 'error', parameters: unknown[]) => void,
) {
  output.warn = (...parameters: unknown[]) => {
    callback('warn', parameters);
    console.warn(...parameters);
  };
  output.error = (...parameters: unknown[]) => {
    callback('error', parameters);
    console.error(...parameters);
  };
}

export const output = {
  log: console.log,
  warn: console.warn,
  // FEATURE: display the error message in a toast
  error: console.error,
  trace: console.trace,
  throw(error: Error | string): never {
    const resolved = typeof error === 'string' ? new Error(error) : error;
    output.error(resolved);
    throw resolved;
  },
};
