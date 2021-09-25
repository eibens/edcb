# Contributing

[edcb] is itself built with [edcb]. The developer CLI is defined in [dev.ts].

```sh
deno run -A dev.ts
```

The GitHub Actions [ci workflow](.github/workflows/ci.yaml) runs edcb with the
`--ci` flag on every push or pull request.

[edcb]: README.md
