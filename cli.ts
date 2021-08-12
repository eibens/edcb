import * as edcb from "./mod.ts";
import {
  CheckHandlers,
  createCheckOptions,
  createInitOptions,
  InitHandlers,
  version,
} from "./mod.ts";
import {
  fromTaskKindHandler,
  runTask,
  TaskPostState,
  TaskState,
} from "./utils/task.ts";
import {
  bgBlack,
  blue,
  bold,
  cyan,
  gray,
  green,
  italic,
  magenta,
  red,
  underline,
  white,
} from "https://deno.land/std@0.101.0/fmt/colors.ts";

if (import.meta.main) {
  await cli();
}

export async function cli() {
  const [command] = Deno.args;
  if (command === "init") {
    await init();
  } else if (command === "check") {
    await check();
  } else {
    await check();
  }
}

async function init() {
  const options = await createInitOptions({
    handlers: {
      lstat: handleLstat(),
      writeFile: handleWriteFile(),
    },
  });
  await runTask(
    "edcb",
    handleEdcb(),
    [options],
    edcb.init,
  );
}

async function check() {
  const options = await createCheckOptions({
    handlers: {
      run: handleRun(),
      writeFile: handleWriteFile(),
    },
  });
  await runTask(
    "edcb",
    handleEdcb(),
    [options],
    edcb.check,
  );
}

function handleEdcb() {
  return fromTaskKindHandler({
    post: handlePost(),
    pre: (state) => {
      log(state, version.tag || italic("<unknown version>"));
    },
  });
}

function handlePost() {
  return <X>(state: TaskPostState<X>) => {
    const duration = (state.endTime - state.startTime).toFixed(3);
    log(state, `finished in ${duration}s`);
  };
}

function handleRun(): CheckHandlers["run"] {
  return fromTaskKindHandler({
    post: handlePost(),
    pre: (state) => {
      console.log(gray("-".repeat(60)));
      log(state, bgBlack(state.input[0].cmd.join(" ")));
    },
  });
}

function handleWriteFile(): CheckHandlers["writeFile"] {
  return fromTaskKindHandler({
    post: handlePost(),
    pre: (state) => {
      const file = underline(blue(state.input[0]));
      const size = state.input[1].length;
      log(state, `writing ${size} bytes to ${file}`);
    },
  });
}

function handleLstat(): InitHandlers["lstat"] {
  return fromTaskKindHandler({
    result: (state) => {
      if (state.result.isFile) {
        const file = underline(blue(state.input[0]));
        log(state, `file exists: ${file}`);
      }
    },
  });
}

function log(state: TaskState, message: string) {
  const color = {
    pre: cyan,
    error: red,
    result: green,
    post: magenta,
  };
  const kind = color[state.kind](state.kind);
  console.log(`${gray(`[${bold(white(state.name))}:${kind}]`)} ${message}`);
}
