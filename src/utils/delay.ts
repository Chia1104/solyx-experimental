export function delay(ms: number): Promise<void>;
export function delay<T>(ms: number, fn: () => T): Promise<T>;
export function delay<T>(ms: number, fn?: () => T) {
  return new Promise<T | void>(resolve =>
    setTimeout(() => {
      resolve(fn?.());
    }, ms),
  );
}

/** Wait until after the next paint, so lock UI can unmount before callers continue. */
export function deferToNextFrame(): Promise<void> {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}
