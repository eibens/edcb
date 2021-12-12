import * as fmt from "./fmt.ts";

export type TreeLogger = {
  open: (level: fmt.Level, message: string) => void;
  close: (message: string) => void;
  line: (message: string) => void;
  item: (message: string) => void;
};

export function createTreeLogger(log: (x: string) => void): TreeLogger {
  const path: fmt.Level[] = [];
  return {
    open(level, message) {
      this.line("");
      path.push(level);
      log(fmt.indent(path, "open", message));
    },
    close(message) {
      log(fmt.indent(path, "close", message));
      path.pop();
      this.line("");
    },
    item(message) {
      log(fmt.indent(path, "item", message));
    },
    line(message) {
      log(fmt.indent(path, "line", message));
    },
  };
}
