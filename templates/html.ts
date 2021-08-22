export type HtmlTemplate = {
  modules: string[];
  title?: string;
  body?: string;
};

export const createHtml = (options: HtmlTemplate) =>
  `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${options.title || "Untitled Website"}</title>
    ${
    options.modules.map((name) =>
      `
    <script defer type="module">
      import "${name}"
    </script>
    `.trimStart()
    ).join("")
  }
  </head>
  <body>${options.body || ""}</body>
</html>
`.trimStart();
