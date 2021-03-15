export class ExecutionContext {
  private variables: Record<string, any | undefined> = {};

  public resolveVariable(identifier: string): any {
    if (this.variables[identifier] === undefined)
      throw `Unknown variable ${identifier}`;

    return this.variables[identifier];
  }

  public pushVariable(identifier: string, value: any) {
    this.variables[identifier] = value;
  }

  public popVariable(identifier: string) {
    this.variables[identifier] = undefined;
  }
}

export interface Resolvable {
  resolve: (context: ExecutionContext) => Promise<any>;
}
