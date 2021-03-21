import { GuildChannel, GuildMember, Message, Role } from "discord.js";
import { ExecutionContext, Resolvable } from "../execution-context";
import { ResolvedValue } from "../values";

export class DiscordChannel implements Resolvable {
  constructor(private channel: GuildChannel | string) {}

  async resolve(_: ExecutionContext, message: Message): Promise<ResolvedValue> {
    if (this.channel instanceof GuildChannel) {
      return ["object", this.channel];
    } else {
      const resolved = message.guild.channels.resolve(this.channel);
      if (resolved === null) {
        return [
          "error",
          `The channel of id ${this.channel} couldn't be resolved`,
        ];
      }
      return ["object", resolved];
    }
  }
}

export class DiscordUser implements Resolvable {
  constructor(private user: GuildMember | string) {}

  async resolve(_: ExecutionContext, message: Message): Promise<ResolvedValue> {
    if (this.user instanceof GuildMember) {
      return ["object", this.user];
    } else {
      const resolved = message.guild.members.resolve(this.user);
      if (resolved === null) {
        return ["error", `The user of id ${this.user} couldn't be resolved`];
      }
      return ["object", resolved];
    }
  }
}

export class DiscordRole implements Resolvable {
  constructor(private role: Role | string) {}

  async resolve(_: ExecutionContext, message: Message): Promise<ResolvedValue> {
    if (this.role instanceof Role) {
      return ["object", this.role];
    } else {
      const resolved = message.guild.roles.resolve(this.role);
      if (resolved === null) {
        return ["error", `The role of id ${this.role} couldn't be resolved`];
      }
      return ["object", resolved];
    }
  }
}
