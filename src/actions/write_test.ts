import { write, WriteOptions } from "./write.ts";
import { assertEquals } from "https://deno.land/std@0.103.0/testing/asserts.ts";

Deno.test("write runs with mock options", async () => {
  await write(mockWriteOptions());
});

Deno.test("write writes file if it does not exist", async () => {
  let actual = false;
  await write({
    ...mockWriteOptions(),
    writeFile: () => {
      actual = true;
      return Promise.resolve();
    },
  });
  assertEquals(actual, true);
});

Deno.test("write passes file name to writeFile function", async () => {
  let actual = "";
  await write({
    ...mockWriteOptions(),
    writeFile: (path) => {
      actual = String(path);
      return Promise.resolve();
    },
  });
  assertEquals(actual, "answer.txt");
});

Deno.test("write passes data to writeFile function", async () => {
  let actual = "";
  await write({
    ...mockWriteOptions(),
    writeFile: (_path, data) => {
      actual = new TextDecoder().decode(data);
      return Promise.resolve();
    },
  });
  assertEquals(actual, "42");
});

Deno.test("write passes directory name to mkdir", async () => {
  let actual = "";
  await write({
    ...mockWriteOptions(),
    file: "/home/user/my/answer.txt",
    mkdir: (path) => {
      actual = String(path);
      return Promise.resolve();
    },
  });
  assertEquals(actual, "/home/user/my");
});

Deno.test("write does not make director if it exists", async () => {
  await write({
    ...mockWriteOptions(),
    lstat: () => {
      return Promise.resolve({} as Deno.FileInfo);
    },
    mkdir: () => {
      throw new Error("should not be called");
    },
  });
});

Deno.test("write does not write file if it exists", async () => {
  await write({
    ...mockWriteOptions(),
    lstat: () => {
      return Promise.resolve({} as Deno.FileInfo);
    },
    writeFile: () => {
      throw new Error("should not be called");
    },
  });
});

Deno.test("write overwrites file if force is used", async () => {
  let actual = false;
  await write({
    ...mockWriteOptions(),
    force: true,
    lstat: () => {
      return Promise.resolve({} as Deno.FileInfo);
    },
    writeFile: () => {
      actual = true;
      return Promise.resolve();
    },
  });
  assertEquals(actual, true);
});

function mockWriteOptions(): WriteOptions {
  return {
    data: "42",
    file: "answer.txt",
    force: false,
    lstat: () => {
      throw new Deno.errors.NotFound(
        "Mock not implemented: no file exists per default.",
      );
    },
    mkdir: () => {
      return Promise.resolve();
    },
    writeFile: () => {
      return Promise.resolve();
    },
  };
}
