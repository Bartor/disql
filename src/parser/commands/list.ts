import { Message } from "discord.js";
import { Command } from "../model/command";
import { IterableGetter, iterableObjects } from "../model/iterables";
import { Filter, FilterUnion } from "./subcommands/filter";

export class ListArgs {
  iterable: IterableGetter;

  constructor(iterable: string, public filters: Filter | FilterUnion) {
    if (iterableObjects[iterable] !== undefined) {
      this.iterable = iterableObjects[iterable];
    } else {
      throw "Unknown iterable";
    }
  }
}

export class ListCommand implements Command {
  constructor(private args: ListArgs) {}

  async execute(message: Message): Promise<string> {
    return JSON.stringify(
      (await this.args.iterable(message)).filter((value) =>
        this.args.filters.execute(value)
      )
    );
  }
}
