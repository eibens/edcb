type Async<T = void> = T | Promise<T>;

export type ContainerProps = {
  open?: () => Async;
  close?: () => Async;
};

export function withContainer(props: ContainerProps) {
  // deno-lint-ignore no-explicit-any
  return <F extends (...x: any[]) => any>(func: F): F => {
    return (
      async (...input) => {
        try {
          if (props.open) await props.open();
          return await func(...input);
        } finally {
          if (props.close) await props.close();
        }
      }
    ) as F; // TODO: Try to remove this cast.
  };
}
