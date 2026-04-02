import { useRef, useCallback, useEffect } from "react";

export function useHoldRepeat(
  callback: () => void,
  deps: React.DependencyList,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(0 as unknown as ReturnType<typeof setTimeout>);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(0 as unknown as ReturnType<typeof setInterval>);
  const speedRef = useRef(300);

  const cb = useCallback(callback, deps); // eslint-disable-line react-hooks/exhaustive-deps

  const stop = useCallback(() => {
    clearTimeout(timerRef.current);
    clearInterval(intervalRef.current);
    speedRef.current = 300;
  }, []);

  const start = useCallback(() => {
    cb();
    speedRef.current = 300;
    const schedule = () => {
      intervalRef.current = setInterval(() => {
        cb();
        if (speedRef.current > 50) {
          clearInterval(intervalRef.current);
          speedRef.current = Math.max(50, speedRef.current - 50);
          schedule();
        }
      }, speedRef.current);
    };
    timerRef.current = setTimeout(schedule, 400);
  }, [cb]);

  useEffect(() => stop, [stop]);

  return { start, stop };
}
