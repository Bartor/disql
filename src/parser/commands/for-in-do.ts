import { Message } from "discord.js";
import { Command } from "../model/command";
import { ExecutionContext, Resolvable } from "../model/execution-context";
import { ResolvedValue, Value } from "../model/value";

export class MapArgs {
  constructor(
    public variableIdentifier: string,
    public iterationTarget: Value,
    public command: Command,
    public indexIdentifier?: string
  ) {}
}

export class MapCommand implements Command, Resolvable {
  constructor(private args: MapArgs, private context: ExecutionContext) {}

  async execute(message: Message): Promise<Value> {
    const result = [];
    const [, iterationElements] = await this.args.iterationTarget.resolve(
      this.context,
      message
    );

    for (let [index, element] of iterationElements.entries()) {
      this.context.pushVariable(this.args.variableIdentifier, element);
      if (this.args.indexIdentifier) {
        this.context.pushVariable(
          this.args.indexIdentifier,
          new Value("number", index)
        );
      }
      result.push(await this.args.command.execute(message));
      if (this.args.indexIdentifier) {
        this.context.popVariable(this.args.indexIdentifier);
      }
      this.context.popVariable(this.args.variableIdentifier);
    }
    return new Value("iterable", result);
  }

  resolve(_, message: Message): Promise<ResolvedValue> {
    return this.execute(message).then((value) =>
      value.resolve(this.context, message)
    );
  }
}
