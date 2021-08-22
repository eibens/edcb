export type PreState<X> = {
  input: X;
  startTime: number;
};

export type PostState<X> = PreState<X> & {
  endTime: number;
};

export type ResultState<X, Y> = PostState<X> & {
  result: Y extends Promise<infer y> ? y : never;
};
export type ErrorState<X> = PostState<X> & {
  error: Error;
};

export type Handler<S> = (state: S) => Promise<void>;

export type Handlers<X, Y> = {
  pre: Handler<PreState<X>>;
  result: Handler<ResultState<X, Y>>;
  error: Handler<ErrorState<X>>;
  post: Handler<PostState<X>>;
};

// deno-lint-ignore no-explicit-any
export function create<X extends unknown[], Y extends Promise<any>>(
  on: Handlers<X, Y>,
) {
  return (func: (...x: X) => Y) => {
    return async (...input: X) => {
      const clock = () => Date.now() / 1_000;
      const pre: PreState<X> = { input, startTime: clock() };
      await on.pre(pre);
      try {
        const result = await func(...input);
        await on.result({ ...pre, result, endTime: clock() });
        return result;
      } catch (error) {
        await on.error({ ...pre, error, endTime: clock() });
        throw error;
      } finally {
        await on.post({ ...pre, endTime: clock() });
      }
    };
  };
}
