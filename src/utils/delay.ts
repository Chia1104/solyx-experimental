export function delay(ms: number): Promise<void>;
export function delay<T>(ms: number, fn: () => T): Promise<T>;
export function delay<T>(ms: number, fn?: () => T) {
  return new Promise<T | void>(resolve =>
    setTimeout(() => {
      resolve(fn?.());
    }, ms),
  );
}
