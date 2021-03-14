import * as Discord from "discord.js";
import { loadSecrets } from "./config/loader";
const parser = require("./parser/generated/parser");

const client = new Discord.Client();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.username}`);
});

client.on("message", async (message) => {
  // This is just PoC code
  try {
    const result = parser.parse(message.content);
    const commandResult: Discord.Collection<
      string,
      any
    > = await result.args.iterable(message);
    message.reply(commandResult.keyArray().join("\n"));
  } catch (e) {
    console.log(e);
  }
});

(async () => {
  const secrets = await loadSecrets();

  client.login(secrets.apiToken);
})();
