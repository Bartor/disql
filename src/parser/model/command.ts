import { Message } from "discord.js";

export interface Command {
  execute: (message: Message) => Promise<string>;
}

export interface IterableSubcommand {
  execute: (any: object) => any;
}
