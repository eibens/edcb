import * as builders from "./actions/mod.ts";
import * as di from "https://raw.githubusercontent.com/eibens/dein/master/mod.ts";

export type Actions = ReturnType<typeof factory>;
export type Hooks = di.Hooks<Actions>;
export const factory = di.inject(builders);
export const chain = di.chain;
