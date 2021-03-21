import { Resolvable } from "./execution-context";
import { ResolvedValue, Value } from "./values";

export class DictArgs {
  constructor(public fields: { key: string; value: Value }[]) {}
}

export class Dict extends Value implements Resolvable {
  constructor(private args: DictArgs) {
    super(
      "object",
      args.fields.reduce((acc, field) => ({ ...acc, ...field }), {})
    );
  }

  async resolve(): Promise<ResolvedValue> {
    return ["object", this.value];
  }
}
