// deno-lint-ignore no-explicit-any
export type Func = (...x: any[]) => Promise<any>;

export type ValueOptions<F extends Func> = InputOptions<F> & {
  value: Value<F>;
};

export type InputOptions<F extends Func> = {
  input: Parameters<F>;
};

export type Value<F extends Func> = ReturnType<F> extends Promise<infer V> ? V
  : never;

export type ErrorOptions<F extends Func> = InputOptions<F> & {
  error: Error;
};

type Async<T = void> = T | Promise<T>;

export type RunnerProps<F extends Func> = {
  input?: (...input: Parameters<F>) => Async;
  value?: (value: Value<F>, ...input: Parameters<F>) => Async;
  error?: (error: Error, ...input: Parameters<F>) => Async;
};

export function withRunner<F extends Func>(props: RunnerProps<F> = {}) {
  type y = ReturnType<F> extends Promise<infer y> ? y : never;
  return (func: F): F => {
    return (
      async (...input: Parameters<F>): Promise<y> => {
        if (props.input) await props.input(...input);
        try {
          const value = await func(...input);
          if (props.value) await props.value(value, ...input);
          return value as y;
        } catch (error) {
          if (props.error) await props.error(error, ...input);
          throw error;
        }
      }
    ) as F; // TODO: Try to remove this cast.
  };
}
