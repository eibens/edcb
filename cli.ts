import {
  cyan,
  gray,
  green,
  red,
} from "https://deno.land/std@0.101.0/fmt/colors.ts";

if (import.meta.main) {
  if (Deno.args[0] === "upgrade") {
    console.info(
      "[edcb] use `deno install -f -A https://deno.land/x/edcb/cli.ts`",
    );
    console.error(red("[edcb] CLI does not yet support `upgrade`"));
    Deno.exit(1);
  }

  // NOTE: Infer version of `edcb.sh` from module URL.
  const thisUrl = import.meta.url;
  if (!thisUrl.match(/\/cli\.ts$/)) {
    console.error(red("[edcb] was loaded from unknown source"));
    Deno.exit(1);
  }
  const rootUrl = thisUrl.substr(0, thisUrl.length - "cli.ts".length);
  const scriptUrl = rootUrl + "edcb.sh";

  // NOTE: Since we build the bash script URL from the module URL,
  // it can either be 'file' or 'http' / 'https' protocols.
  // For example, when running `deno run -A cli.ts` in this project,
  // the `edcb.sh` file will be used directly as a file. If someone
  // runs `deno run -A http://deno.land/x/edcb@1.2.3/cli.ts`,
  // `https://deno.land/x/edcb@1.2.3/edcb.ts` will be downloaded.
  const { protocol, pathname } = new URL(scriptUrl);
  let file = pathname;

  // File must be downloaded from URL.
  if (protocol !== "file:") {
    console.log(cyan("[edcb] downloading"));
    const script = await (await fetch(scriptUrl)).text();

    console.log(cyan("[edcb] installing"));
    file = (await Deno.makeTempFile()) + ".edcb.sh";
    await Deno.writeTextFile(file, script);
  }

  console.log(cyan("[edcb] running: " + file));
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
