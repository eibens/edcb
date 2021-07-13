import {
  blue,
  cyan,
  gray,
  green,
  magenta,
  red,
} from "https://deno.land/std@0.101.0/fmt/colors.ts";
import { dirname, join } from "https://deno.land/std@0.101.0/path/mod.ts";

if (import.meta.main) {
  if (Deno.args[0] === "upgrade") {
    console.info(
      "[edcb] use `deno install -f -A https://deno.land/x/edcb/cli.ts`",
    );
    console.error(red("[edcb] CLI does not yet support `upgrade`"));
    Deno.exit(1);
  }

  const file = await install();

  console.log(blue("[edcb] file: " + file));
  console.log(cyan("[edcb] running"));

  const process = Deno.run({
    cmd: ["bash", file, ...Deno.args],
  });

  console.log(gray("-".repeat(32)));
  const status = await process.status();
  console.log(gray("-".repeat(32)));

  if (status.success) {
    console.log(green("[edcb] succeeded"));
  } else {
    console.error(red("[edcb] failed"));
    Deno.exit(1);
  }
}

async function install(): Promise<string> {
  // Locate edcb.sh script file.
  const url = new URL(import.meta.url);
  url.pathname = join(dirname(url.pathname), "edcb.sh");

  // Log version.
  const match = url.pathname.match(/v[0-9]+\.[0-9]+\.[0-9]+/);
  const version = match ? match[0] : "unknown";
  console.log(magenta("[edcb] version: " + version));

  switch (url.protocol) {
    case "file:": {
      return url.pathname;
    }
    case "http:":
    case "https:": {
      console.log(blue("[edcb] url:" + url));
      console.log(cyan("[edcb] downloading"));
      const script = await (await fetch(url)).text();

      console.log(cyan("[edcb] installing"));
      const tmpFile = (await Deno.makeTempFile()) + ".edcb.sh";
      await Deno.writeTextFile(tmpFile, script);
      return tmpFile;
    }
    default:
      throw new Error("[edcb] unknown source protocol");
  }
}
