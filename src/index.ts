import * as Discord from "discord.js";
import { inspect } from "util";
import { COMMAND_PREFIX } from "../configuration";
import { loadSecrets } from "./config/loader";
import { Command } from "./parser/model/command";
const parser = require("./parser/generated/parser");

const client = new Discord.Client();
export const CLIENT_INSTANCE = client;

client.on("ready", () => {
  console.log(`Logged in as ${client.user.username}`);
});

client.on("message", async (message) => {
  if (message.author.id === client.user.id) return;
  if (!message.content.startsWith(COMMAND_PREFIX)) return;
  // This is just PoC code
  try {
    const parsingResult = parser.parse(
      message.content.slice(COMMAND_PREFIX.length)
    ) as Command;
    console.log("AST:", inspect(parsingResult, false, null, true));
    const commandResult = await parsingResult.execute(message);
    console.log("RESULT:", inspect(commandResult, false, null, true));
    message.reply(commandResult.toString(), {
      split: true,
    });
  } catch (e) {
    console.error(e);

    if (typeof e === "string") {
      message.reply(e);
    } else if (e instanceof Discord.DiscordAPIError) {
      message.reply("There was a problem with Discord API");
    } else {
      message.reply(
        `incorrect command syntax; expected ${e.expected
          .map((e) => `\`${e.text ?? e.parts}\``)
          .join(", ")}, but got \`${e.found}\` on position ${
          e.location.start.offset
        }`
      );
    }
  }
});

(async () => {
  const secrets = await loadSecrets();

  client.login(secrets.apiToken);
})();
