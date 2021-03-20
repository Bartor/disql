import { Message } from "discord.js";
import { Command } from "../model/command";
import { ErrorValue } from "../model/error";
import { ExecutionContext, Resolvable } from "../model/execution-context";
import { isValueType, ResolvedValue, Value } from "../model/values";

export class GetArgs {
  constructor(public value: Value, public key: Value) {}
}

export class GetCommand implements Command, Resolvable {
  constructor(private args: GetArgs, private context: ExecutionContext) {}

  async execute(message: Message): Promise<Value> {
    const [, key] = await this.args.key.resolve(this.context, message);
    const [, value] = await this.args.value.resolve(this.context, message);

    if (value === undefined) {
      return new ErrorValue(`Cannot get ${key} from undefined`);
    }

    const valueType = typeof value;
    if (isValueType(valueType)) {
      return new Value(valueType, value[key]);
    } else {
      return new Value("object", value[key]);
    }
  }

  resolve(_, message: Message): Promise<ResolvedValue> {
    return this.execute(message).then((value) =>
      value.resolve(this.context, message)
    );
  }
}
