import { createCiYaml } from "../templates/ci_yaml.ts";
import { createDevTs } from "../templates/dev_ts.ts";
import { WriteOptions } from "./write.ts";

export type InitDeps = {
  write: (options: WriteOptions) => Promise<boolean>;
};

export type InitOptions = {
  force: boolean;
  version: string;
  workflowFile: boolean;
  devFile: boolean;
};

export function init(deps: InitDeps) {
  return async function (options: InitOptions) {
    const workflowFile = ".github/workflows/ci.yml";
    const devFile = "dev.ts";

    if (options.workflowFile) {
      await deps.write({
        force: options.force,
        file: workflowFile,
        data: createCiYaml(),
      });
    }

    if (options.devFile) {
      await deps.write({
        force: options.force,
        file: devFile,
        data: createDevTs({
          version: options.version,
        }),
      });
    }
  };
}
