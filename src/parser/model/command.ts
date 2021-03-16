import { Message } from "discord.js";
import { Value } from "./value";

export interface Command {
  execute: (message: Message) => Promise<Value>;
}