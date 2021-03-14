import { Collection, Message } from "discord.js";

const getUsersIterable = (message: Message) => message.guild.members.fetch();
const getChannelsIterable = (message: Message) =>
  Promise.resolve(message.guild.channels.cache);
const getRolesIterable = (message: Message) =>
  Promise.resolve(message.guild.roles.cache);

export type IterableGetter = (
  message: Message
) => Promise<Collection<string, any>>;

export const iterableObjects: Record<string, IterableGetter | undefined> = {
  users: getUsersIterable,
  channels: getChannelsIterable,
  roles: getRolesIterable,
};
