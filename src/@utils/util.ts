// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const branch = <A extends any[], AL, AR, L, R>(
  test: (...args: A) => boolean,
  left: (...args: AL[]) => L,
  right: (...args: AR[]) => R
): ((...args: A) => L | R) => {
  return (...args: A): L | R =>
    test(...args) ? left(...args) : right(...args);
};
