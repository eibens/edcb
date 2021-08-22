export type DevTsTemplate = {
  version?: string;
};

export function createDevTs(options: DevTsTemplate) {
  const version = options.version;
  const tag = version ? `@${version}` : "";
  const url = `https://deno.land/x/edcb${tag}/cli.ts`;
  return `import { cli } from "${url}";

await cli();\n`;
}
