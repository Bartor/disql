import { Message } from "discord.js";
import { Value } from "./values";

export interface Command {
  execute: (message: Message) => Promise<Value>;
}