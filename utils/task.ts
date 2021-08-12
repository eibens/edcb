export type TaskStartState<X> = {
  name: string;
  input: X;
  startTime: number;
};

export type TaskEndState<X> = TaskStartState<X> & {
  endTime: number;
};

export type TaskPreState<X> = TaskStartState<X> & {
  kind: "pre";
};

export type TaskResultState<X, Y> = TaskEndState<X> & {
  kind: "result";
  result: Y;
};
export type TaskErrorState<X> = TaskEndState<X> & {
  kind: "error";
  error: Error;
};

export type TaskPostState<X> = TaskEndState<X> & {
  kind: "post";
};

export type TaskState<X = unknown, Y = unknown> =
  | TaskPreState<X>
  | TaskResultState<X, Y>
  | TaskErrorState<X>
  | TaskPostState<X>;

export type TaskKind = TaskState<unknown, unknown>["kind"];

export type TaskHandler<X = [], Y = void> = (
  state: TaskState<X, Y>,
) => void | Promise<void>;

// Running

export async function runTask<X extends unknown[] = [], Y = void>(
  name: string,
  handler: TaskHandler<X, Y>,
  input: X,
  main: (...x: X) => Y | Promise<Y>,
): Promise<Y> {
  const clock = () => Date.now() / 1_000;
  const pre = toPre(name, input, clock());
  await handler(pre);
  try {
    const result = await main(...input);
    await handler(toResult(pre, result, clock()));
    return result;
  } catch (error) {
    await handler(toError(pre, error, clock()));
    throw error;
  } finally {
    await handler(toPost(pre, clock()));
  }
}

export function toTask<X extends unknown[] = [], Y = void>(
  name: string,
  handler: TaskHandler<X, Y>,
  main: (...x: X) => Y | Promise<Y>,
) {
  return async (...x: X): Promise<Y> => {
    return await runTask(name, handler, x, main);
  };
}

// Handle kind

export type TaskKindHandler<X, Y> = Partial<{
  pre: (state: TaskPreState<X>) => void | Promise<void>;
  result: (state: TaskResultState<X, Y>) => void | Promise<void>;
  error: (state: TaskErrorState<X>) => void | Promise<void>;
  post: (state: TaskPostState<X>) => void | Promise<void>;
}>;

export function fromTaskKindHandler<X, Y>(
  handlers: Partial<TaskKindHandler<X, Y>>,
): TaskHandler<X, Y> {
  return async (state) => {
    const handler = handlers[state.kind] as TaskHandler<X, Y>;
    if (handler) await handler(state);
  };
}

// Handle name

export type TaskNameHandler<X = unknown, Y = unknown> = Record<
  string,
  TaskHandler<X, Y>
>;

export function fromTaskNameHandler<X, Y>(
  handlers: TaskNameHandler<X, Y>,
): TaskHandler<X, Y> {
  return async (state) => {
    const handler = handlers[state.name];
    if (handler) await handler(state);
  };
}

export function toTaskNameHandler<X, Y>(
  handler: TaskHandler<X, Y>,
): Record<PropertyKey, TaskHandler<X, Y>> {
  return new Proxy({}, {
    get: (): TaskHandler<X, Y> => {
      return (state) => handler(state);
    },
  });
}

// Handle name and kind

export type TaskNameKindHandler<K extends PropertyKey, X, Y> = {
  [k in K]: Partial<TaskKindHandler<X, Y>>;
};

// State transitions

function toPre<X>(
  name: string,
  input: X,
  startTime: number,
): TaskPreState<X> {
  return {
    name,
    kind: "pre",
    input,
    startTime,
  };
}

function toResult<X, Y>(
  state: TaskStartState<X>,
  result: Y,
  endTime: number,
): TaskResultState<X, Y> {
  return { ...state, kind: "result", result, endTime };
}

function toError<X>(
  state: TaskStartState<X>,
  error: Error,
  endTime: number,
): TaskErrorState<X> {
  return { ...state, kind: "error", error, endTime };
}

function toPost<X>(
  state: TaskStartState<X>,
  endTime: number,
): TaskPostState<X> {
  return { ...state, kind: "post", endTime };
}
