import { Message } from "discord.js";
import { Command } from "./command";

const getUsersIterable = (message: Message) =>
  message.guild.members.fetch().then((collection) => collection.array());
const getChannelsIterable = (message: Message) =>
  Promise.resolve(message.guild.channels.cache.array());
const getRolesIterable = (message: Message) =>
  Promise.resolve(message.guild.roles.cache.array());

export type IterableValue = Array<Record<string, any>>;

export type IterableGetter = (message: Message) => Promise<IterableValue>;

const iterableObjects: Record<string, IterableGetter | undefined> = {
  users: getUsersIterable,
  channels: getChannelsIterable,
  roles: getRolesIterable,
};

export class IterableSource implements Command {
  constructor(private source: "users" | "channels" | "roles" | IterableSource) {
    if (
      !(source instanceof IterableSource) &&
      iterableObjects[source] === undefined
    ) {
      throw `Unknown iteration source ${source}`;
    }
  }

  async execute(message: Message): Promise<IterableValue> {
    if (this.source instanceof IterableSource) {
      return this.source.execute(message);
    } else {
      return iterableObjects[this.source](message);
    }
  }
}
