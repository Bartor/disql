import { Message } from "discord.js";
import { Command, CommandArgs } from "../model/command";
import { ExecutionContext } from "../model/execution-context";
import { IterableSource } from "../model/iterables";

export class ForInDoArgs implements CommandArgs {
  constructor(
    public variableIdentifier: string,
    public iterationTarget: IterableSource,
    public command: Command
  ) {}
}

export class ForInDoCommand implements Command {
  constructor(private args: ForInDoArgs, private context: ExecutionContext) {}

  async execute(message: Message): Promise<Array<any>> {
    const result = [];
    for (let element of await this.args.iterationTarget.execute(message)) {
      this.context.pushVariable(this.args.variableIdentifier, element);
      result.push(await this.args.command.execute(message));
      this.context.popVariable(this.args.variableIdentifier);
    }
    return result;
  }
}
