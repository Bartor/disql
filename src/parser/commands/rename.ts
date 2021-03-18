import {
  DiscordAPIError,
  GuildChannel,
  GuildMember,
  Message,
  Role,
} from "discord.js";
import { Command } from "../model/command";
import { ExecutionContext, Resolvable } from "../model/execution-context";
import { Value } from "../model/value";

export class RenameArgs {
  constructor(public object: Value, public newName: string) {}
}

export class RenameCommand implements Command, Resolvable {
  constructor(private args: RenameArgs, private context: ExecutionContext) {}

  async execute(message: Message): Promise<Value> {
    const object = await this.args.object.resolve(this.context, message);

    try {
      if (object instanceof GuildChannel) {
        await object.edit({ name: this.args.newName });
      } else if (object instanceof GuildMember) {
        await object.setNickname(this.args.newName);
      } else if (object instanceof Role) {
        await object.setName(this.args.newName);
      } else {
        throw "Given object cannot be renamed";
      }
    } catch (e) {
      if (e instanceof DiscordAPIError) {
        return new Value(
          "error",
          `Couldn't rename ${object.name ?? object.id ?? ""}, reason: ${
            e.message
          }`
        );
      } else {
        return new Value("error", e);
      }
    }

    return new Value("object", object);
  }

  async resolve(_, message: Message): Promise<Value> {
    return this.execute(message).then((value) =>
      value.resolve(this.context, message)
    );
  }
}
