export const delay = (ms: number, fn?: () => void) =>
  new Promise(resolve =>
    setTimeout(() => {
      resolve(fn?.());
    }, ms),
  );
