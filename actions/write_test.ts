import { write, WriteDeps, WriteOptions } from "./write.ts";
import { assertEquals } from "https://deno.land/std@0.103.0/testing/asserts.ts";

Deno.test("write runs with mock options", async () => {
  await write(mockWriteDeps())(mockWriteOptions());
});

Deno.test("write writes file if it does not exist", async () => {
  let actual = false;
  await write({
    ...mockWriteDeps(),
    writeFile: () => {
      actual = true;
      return Promise.resolve();
    },
  })(mockWriteOptions());
  assertEquals(actual, true);
});

Deno.test("write passes file name to writeFile function", async () => {
  let actual = "";
  await write({
    ...mockWriteDeps(),
    writeFile: (path) => {
      actual = String(path);
      return Promise.resolve();
    },
  })(mockWriteOptions());
  assertEquals(actual, "answer.txt");
});

Deno.test("write passes data to writeFile function", async () => {
  let actual = "";
  await write({
    ...mockWriteDeps(),
    writeFile: (_path, data) => {
      actual = new TextDecoder().decode(data);
      return Promise.resolve();
    },
  })(mockWriteOptions());
  assertEquals(actual, "42");
});

Deno.test("write passes directory name to mkdir", async () => {
  let actual = "";
  await write({
    ...mockWriteDeps(),
    mkdir: (path) => {
      actual = String(path);
      return Promise.resolve();
    },
  })({
    ...mockWriteOptions(),
    file: "/home/user/my/answer.txt",
  });
  assertEquals(actual, "/home/user/my");
});

Deno.test("write does not make director if it exists", async () => {
  await write({
    ...mockWriteDeps(),
    lstat: () => {
      return Promise.resolve({} as Deno.FileInfo);
    },
    mkdir: () => {
      throw new Error("should not be called");
    },
  })(mockWriteOptions());
});

Deno.test("write does not write file if it exists", async () => {
  await write({
    ...mockWriteDeps(),
    lstat: () => {
      return Promise.resolve({} as Deno.FileInfo);
    },
    writeFile: () => {
      throw new Error("should not be called");
    },
  })(mockWriteOptions());
});

Deno.test("write overwrites file if force is used", async () => {
  let actual = false;
  await write({
    ...mockWriteDeps(),
    lstat: () => {
      return Promise.resolve({} as Deno.FileInfo);
    },
    writeFile: () => {
      actual = true;
      return Promise.resolve();
    },
  })({
    ...mockWriteOptions(),
    force: true,
  });
  assertEquals(actual, true);
});

function mockWriteDeps(): WriteDeps {
  return {
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

function mockWriteOptions(): WriteOptions {
  return {
    data: "42",
    file: "answer.txt",
    force: false,
  };
}
