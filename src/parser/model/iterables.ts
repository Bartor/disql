import { Message } from "discord.js";
import { Value } from "./value";

const getUsersIterable = (message: Message) =>
  message.guild.members.cache.array().map((e) => new Value("object", e));
const getChannelsIterable = (message: Message) =>
  message.guild.channels.cache.array().map((e) => new Value("object", e));
const getRolesIterable = (message: Message) =>
  message.guild.roles.cache.array().map((e) => new Value("object", e));

export type IterableGetter = (message: Message) => Array<Value>;

export const iterableObjects: Record<string, IterableGetter | undefined> = {
  users: getUsersIterable,
  channels: getChannelsIterable,
  roles: getRolesIterable,
};
