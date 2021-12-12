export const help = `
edcb: Linting, testing, bundling and more for Deno projects.

Usage: 
  edcb <command> [...options]

Command:
  build                Format, lint, test, and bundle files.
  serve                Start a web-server for development.

Options: 
  -h, --help           Show this help text.
  -v, --version        Show the version.
  --check              Verifies a clean build (useful for CI).
  --debug              Print sub-process output.
  --codecov[=<token>]  Upload coverage file to codecov.io.
  --hostname=<name>    HTTP server hostname [default: localhost].
  --ignore=<paths>     Comma-separated list of paths to ignore.
  --port=<num>         HTTP server port [default: 8080].
  --reload             Enable file change broadcasts via WebSocket.
  --root=<path>        Root for file watcher [default: .].
  --temp=<path>        Specify location for temporary files.
  --tests=<path>       Single file pattern for locating unit tests.
  --web-root=<path>    Root for static file serving [default: .]

Config:
  edcb uses a TypeScript file 'dev.ts' for configuration.
  The 'bundles' option is only available in 'dev.ts'.
  See: https://github.com/eibens/edcb#config

More information: https://github.com/eibens/edcb
`.trim();
