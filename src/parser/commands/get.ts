import { Collection, Message } from "discord.js";
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
    const [keyType, key] = await this.args.key.resolve(this.context, message);
    const [, value] = await this.args.value.resolve(this.context, message);

    // path.in.object type of keys
    if (keyType === "string") {
      const [firstKey, ...rest] = key.split(".");

      if (rest.length > 0) {
        const newGet = new GetCommand(
          new GetArgs(
            new Value("object", value[firstKey]),
            new Value("string", rest.join("."))
          ),
          this.context
        );
        return await newGet.execute(message);
      }
    }

    // Empty objects
    if (value === undefined || value === null) {
      return new ErrorValue(`Cannot get ${key} from undefined`);
    }

    const typeOfValue = typeof value[key];

    if (value[key] instanceof Collection) {
      return new Value("iterable", value[key]);
    }

    if (isValueType(typeOfValue)) {
      return new Value(typeOfValue, value[key]);
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
