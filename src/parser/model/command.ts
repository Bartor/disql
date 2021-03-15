import { Message } from "discord.js";
import { ExecutionContext } from "./execution-context";

export interface Command {
  execute: (message: Message) => Promise<any>;
}

export type CommandArgs = any;

export interface IterableSubcommand {
  execute: (any: object, context: ExecutionContext) => any;
}
