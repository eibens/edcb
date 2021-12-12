type Middleware<T> = (x: T) => T;

export function withChain<T>(...args: Middleware<T>[]): Middleware<T> {
  return (x: T) => args.reduce((y, middleware) => middleware(y), x);
}
