import React from 'react';
import { interceptLogs } from '../Errors/exceptions';
import { usePortal } from '../Molecules/Portal';

/**
 * In development mode, display on the screen all messages logged by the
 * extension
 */
export function DevModeConsoleOverlay() {
  const [logs, setLogs] = React.useState<
    { type: 'log' | 'warn' | 'error'; data: unknown[] }[]
  >([]);
  React.useEffect(
    () =>
      interceptLogs((type, data) =>
        setLogs((logs) => [...logs.slice(-5), { type, data }]),
      ),
    [],
  );

  const { element, portal } = usePortal(
    <div className="pointer-events-none text-2xl absolute bottom-0 left-0 z-[1000]">
      {logs.map(({ type, data }, index) => (
        <div
          key={index}
          role="alert"
          className={
            type === 'log'
              ? 'bg-white'
              : type === 'warn'
                ? 'bg-orange-300'
                : 'bg-red-400'
          }
        >
          {String(data[0])}
        </div>
      ))}
    </div>,
  );

  React.useEffect(() => {
    document.body.append(element);
  }, [element]);

  return portal;
}
