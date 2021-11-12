const info = `
More information on GitHub: https://github.com/eibens/edcb
`.trim();
const configInfo = "See: https://github.com/eibens/edcb#config";

export const home = `
edcb: Linting, testing, bundling and more for Deno projects.
${info}

Usage:
  edcb -h | --help
  edcb -v | --version
  edcb check -h | --help | [options]
  edcb serve -h | --help | [options]

Options:
  -h --help     show this help text
  -v --version  show the version

Config:
  edcb uses a TypeScript file 'dev.ts' for configuration.
  ${configInfo}
`.trim();

export const check = `
edcb-check: Format, lint, and test Deno code.
${info}

Usage: edcb check [options]

Options: 
  -h --help            Show this help text.
  --debug              Print sub-process output.
  --ci                 Check formatting without changing the code.
  --ignore=<paths>     Comma-separated list of paths to ignore.
  --temp=<path>        Specify location for temporary files.
  --tests=<path>       Single file pattern for locating unit tests.
  --codecov[=<token>]  Upload coverage file to codecov.io.
`.trim();

export const serve = `
edcb-serve: Serve a Deno project for development.
${info}

Usage: edcb serve [options]

Options:
  -h --help          Show this help text.
  --debug            Print sub-process output.
  --reload           Enable file change broadcasts via WebSocket.
  --hostname=<name>  HTTP server hostname [default: localhost].
  --port=<num>       HTTP server port [default: 8080].
  --root=<path>      Root for file watcher [default: .].
  --web-root=<path>  Root for static file serving [default: docs]

Config:
  The 'bundles' options is not available on the CLI.
  Provide this option in your 'dev.ts' file.
  ${configInfo}
`.trim();
