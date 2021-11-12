import * as fmt from "../fmt.ts";
import { version } from "../../version.ts";
import { TreeLogger } from "../tree_logger.ts";
import { withGetter } from "../middleware/with_getter.ts";
import { withRunner } from "../middleware/with_runner.ts";

export type DocLogger = {
  header: () => void;
  footer: (error?: Error) => void;
};

export function withLayoutLogger<
  T extends Record<string, (...args: unknown[]) => Promise<never>>,
>(log: TreeLogger) {
  return withGetter<T>(() => {
    return withRunner({
      input: () => {
        log.line("\n\n" + fmt.effectBlue(ASCII_LOGO));

        const level = "debug";
        const fmtLevel = fmt.level(level);

        const fallback = (x: unknown, fallback: string) =>
          x ? String(x) : fmt.italic(fallback);

        const item = (...args: [TemplateStringsArray, ...unknown[]]) =>
          log.item(fmtLevel(...args));

        const data = {
          title: "edcb",
          args: Deno.args.join(" "),
          version: version.tag,
          description: "A build tool and task runner for Deno.",
          author: "Lukas Eibensteiner",
          email: "l.eibensteiner@gmail.com",
          website: "https://github.com/eibens/edcb",
          license: "MIT",
        };

        log.open(level, fmtLevel`${data.title}`);
        log.line("");
        item`arguments:   ${fallback(data.args, "none")}`;
        item`version:     ${fallback(data.version, "unknown")}`;
        item`timestamp:   ${new Date().toISOString()}`;
        item`description: ${data.description}`;
        item`website:     ${fmt.url(data.website)}`;
        item`author:      ${data.author} <${data.email}>`;
        item`license:     ${data.license}`;
        log.line("");
        log.close(fmtLevel`happy coding!`);
      },
      value: () => {
        log.line("");
        log.line(fmt.effectGreen(ASCII_DONE));
        log.line("");
      },
      error: () => {
        log.line("");
        log.line(fmt.effectRed(ASCII_FAIL));
        log.line("");
      },
    });
  });
}

// ASCII art generated here: https://www.messletters.com/en/big-text/
// Use "colossal" style from the dropdown.

const ASCII_LOGO = `
              888          888      
              888          888      
              888          888      
 .d88b.   .d88888  .d8888b 88888b.  
d8P  Y8b d88" 888 d88P"    888 "88b 
88888888 888  888 888      888  888 
Y8b.     Y88b 888 Y88b.    888 d88P 
 "Y8888   "Y88888  "Y8888P 88888P" 
`.substr(1);

const ASCII_DONE = `
     888                            
     888                            
     888                            
 .d88888  .d88b.  88888b.   .d88b.  
d88" 888 d88""88b 888 "88b d8P  Y8b 
888  888 888  888 888  888 88888888 
Y88b 888 Y88..88P 888  888 Y8b.      
 "Y88888  "Y88P"  888  888  "Y8888 
`.substr(1);

const ASCII_FAIL = `
         888                        
         888                        
         888                        
 .d88b.  88888b.  88888b.   .d88b.  
d88""88b 888 "88b 888 "88b d88""88b 
888  888 888  888 888  888 888  888 
Y88..88P 888  888 888  888 Y88..88P 
 "Y88P"  888  888 888  888  "Y88P"  
`.substr(1);
