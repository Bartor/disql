import { DiscordAPIError, GuildMember, Message, Role } from "discord.js";
import { Command } from "../model/command";
import { ErrorValue, UnhandledError } from "../model/error";
import { ExecutionContext, Resolvable } from "../model/execution-context";
import { ResolvedValue, Value } from "../model/values";

export class AssignRoleArgs {
  constructor(public role: Value, public user: Value) {}
}

export class AssignRoleCommand implements Command, Resolvable {
  constructor(
    private args: AssignRoleArgs,
    private context: ExecutionContext
  ) {}

  async execute(message: Message): Promise<Value> {
    const [, role] = await this.args.role.resolve(this.context, message);
    const [, user] = await this.args.user.resolve(this.context, message);

    if (!(role instanceof Role)) {
      return new ErrorValue("Expected a role instance");
    }

    if (!(user instanceof GuildMember)) {
      return new ErrorValue("Expected a user instance");
    }

    try {
      return new Value("object", await user.roles.add(role));
    } catch (e) {
      if (e instanceof DiscordAPIError) {
        return new ErrorValue(
          `Couldn't assign role ${role} to ${user}; reason: ${e.message}`
        );
      } else {
        return new UnhandledError(e);
      }
    }
  }

  resolve(_, message: Message): Promise<ResolvedValue> {
    return this.execute(message).then((value) =>
      value.resolve(this.context, message)
    );
  }
}
