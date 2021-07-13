import {
  cyan,
  gray,
  green,
  red,
} from "https://deno.land/std@0.101.0/fmt/colors.ts";

if (import.meta.main) {
  console.log(cyan("[edcb] downloading"));
  const url = "https://deno.land/x/edcb@v0.4.1/edcb.sh";
  const script = await (await fetch(url)).text();

  console.log(cyan("[edcb] installing"));
  const file = await Deno.makeTempFile();
  await Deno.writeTextFile(file, script);

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
  }
}
