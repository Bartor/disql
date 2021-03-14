import * as Discord from "discord.js";
import { inspect } from "util";
import { loadSecrets } from "./config/loader";
import { Command } from "./parser/model/command";
const parser = require("./parser/generated/parser");

const client = new Discord.Client();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.username}`);
});

client.on("message", async (message) => {
  if (message.author.id === client.user.id) return;
  // This is just PoC code
  try {
    const result = parser.parse(message.content) as Command;
    console.log(inspect(result, false, null, true));
    message.reply(await result.execute(message));
  } catch (e) {
    console.log(e);
  }
});

(async () => {
  const secrets = await loadSecrets();

  client.login(secrets.apiToken);
})();
