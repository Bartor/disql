import { ExecutionContext, Resolvable } from "./execution-context";

export class Value implements Resolvable {
  constructor(
    public readonly type: "number" | "string" | "reference",
    public readonly value: string | number
  ) {}

  public resolve(context: ExecutionContext): any {
    switch (this.type) {
      case "number":
      case "string":
        return this.value;
      case "reference":
        return context.resolveVariable(this.value as string);
    }
  }
}
