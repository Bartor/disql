import { Message } from "discord.js";
import { Command } from "../model/command";
import { IterableGetter, IterableObjects } from "../model/iterables";

export class ListArgs {
  iterable: IterableGetter;

  constructor(iterable: string) {
    if (IterableObjects[iterable] !== undefined) {
      this.iterable = IterableObjects[iterable];
    } else {
      throw "Unknown iterable";
    }
  }
}

export class ListCommand implements Command {
  constructor(public args: ListArgs) {}

  async execute(message: Message): Promise<string> {
    const iterable = await this.args.iterable(message);
    return 
  }
}
