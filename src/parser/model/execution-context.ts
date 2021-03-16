import { Message } from "discord.js";
import { Value } from "./value";

export class ExecutionContext {
  private variables: Record<string, Value | undefined> = {};

  public resolveVariable(identifier: string): Value {
    if (this.variables[identifier] === undefined)
      throw `Unknown variable ${identifier}`;

    return this.variables[identifier];
  }

  public pushVariable(identifier: string, value: Value) {
    this.variables[identifier] = value;
  }

  public popVariable(identifier: string) {
    this.variables[identifier] = undefined;
  }
}

export interface Resolvable {
  resolve: (context: ExecutionContext, message: Message) => Promise<Value>;
}
