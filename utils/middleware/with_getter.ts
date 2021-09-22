type Middleware<T> = (x: T) => T;

export type GetterProps<T> = <K extends keyof T>(
  key: K,
) => Middleware<T[K]>;

// deno-lint-ignore ban-types
export function withGetter<T extends object>(
  props: GetterProps<T>,
): Middleware<T> {
  return (target) => {
    return new Proxy(target, {
      get(_, key) {
        const value = target[key as keyof T];
        const middleware = props(key as keyof T);
        return middleware(value);
      },
    });
  };
}
