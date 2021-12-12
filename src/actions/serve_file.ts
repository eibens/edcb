import { extname, join } from "../../deps/path.ts";
import { contentType } from "../../deps/media_types.ts";

export type ServeFileOptions = {
  webRoot?: string;
  request: Request;
  readFile: typeof Deno.readFile;
};

export async function serveFile(options: ServeFileOptions): Promise<Response> {
  const path = new URL(options.request.url).pathname.substr(1);
  // FIXME: Visitors can potentially navigate out of root.
  const file = join(options.webRoot || ".", path || "index.html");
  try {
    const data = await options.readFile(file);
    const mediaType = contentType(extname(file));
    return new Response(data, {
      headers: {
        "Content-Length": String(data.length),
        ...(mediaType ? { "Content-Type": mediaType } : {}),
      },
    });
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return new Response("404 - Not Found", {
        status: 404,
        statusText: "Not Found",
      });
    }
    throw error;
  }
}
