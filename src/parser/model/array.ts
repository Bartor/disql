import { Resolvable } from "./execution-context";
import { ResolvedValue, Value } from "./values";

export class ValueArray extends Value implements Resolvable {
  constructor(private elements: Value[]) {
    super("iterable", elements);
  }

  async resolve(): Promise<ResolvedValue> {
    return ["iterable", this.elements];
  }
}
