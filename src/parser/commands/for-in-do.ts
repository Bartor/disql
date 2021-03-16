import { Message } from "discord.js";
import { Command } from "../model/command";
import { ExecutionContext, Resolvable } from "../model/execution-context";
import { Value } from "../model/value";

export class ForInDoArgs {
  constructor(
    public variableIdentifier: string,
    public iterationTarget: Value,
    public command: Command
  ) {}
}

export class ForInDoCommand implements Command, Resolvable {
  constructor(private args: ForInDoArgs, private context: ExecutionContext) {}

  async execute(message: Message): Promise<Value> {
    const result = [];
    const iterationElements = await this.args.iterationTarget.resolve(
      this.context,
      message
    );
    for (let element of iterationElements) {
      this.context.pushVariable(this.args.variableIdentifier, element);
      const commandResult = await this.args.command.execute(message);
      result.push(commandResult);
      this.context.popVariable(this.args.variableIdentifier);
    }
    return new Value("iterable", result);
  }

  resolve(_, message: Message): Promise<any> {
    return this.execute(message).then((value) =>
      value.resolve(this.context, message)
    );
  }
}