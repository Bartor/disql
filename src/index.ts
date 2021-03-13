import * as Discord from "discord.js";
import { loadSecrets } from "./config/loader";

const client = new Discord.Client();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.username}`);
});

(async () => {
  const secrets = await loadSecrets();

  client.login(secrets.apiToken);
})();
