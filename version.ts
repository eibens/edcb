import { parse } from "https://deno.land/x/module_url@v0.2.0/mod.ts";

export const version = parse(import.meta.url);
