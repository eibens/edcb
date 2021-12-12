import { withGetter } from "./with_getter.ts";

type Middleware<T> = (x: T) => T;

export type MapProps<T> = {
  [K in keyof T]?: Middleware<T[K]>;
};

// deno-lint-ignore ban-types
export function withMap<T extends object>(props: MapProps<T>): Middleware<T> {
  return withGetter<T>((key) =>
    (value) => {
      const middleware = props[key];
      return middleware ? middleware(value) : value;
    }
  );
}
