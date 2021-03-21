import * as Discord from "discord.js";
import { inspect } from "util";
import {
  COMMAND_PREFIX,
  MAX_EMBED_FIELD_LENGTH,
  MAX_EMBED_LENGTH,
} from "../configuration";
import { loadSecrets } from "./config/loader";
import { Command } from "./parser/model/command";
import { Value } from "./parser/model/values";
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
    const parseStart = process.hrtime();
    const parsingResult = parser.parse(
      message.content.slice(COMMAND_PREFIX.length)
    ) as Command;
    const parseTime = process.hrtime(parseStart);

    console.log("AST:", inspect(parsingResult, false, null, true));

    const executionStart = process.hrtime();
    const commandResult = await parsingResult.execute(message);
    const executionTime = process.hrtime(executionStart);

    // console.log("RESULT:", inspect(commandResult, false, null, true));

    const title = "Execution result";
    const desc = `Parsed in ${parseTime[0]}.${
      parseTime[1] / 1e9
    } s\nExecuted in ${executionTime[0]}.${executionTime[1] / 1e9} s`;
    const footer = "disQl";
    const replyLength = title.length + desc.length + footer.length;

    const reply = new Discord.MessageEmbed()
      .setColor("#0070ff")
      .setTitle(title)
      .setDescription(desc)
      .setFooter(footer)
      .setTimestamp();

    switch (commandResult.type) {
      case "iterable":
        const values = commandResult.value as Array<Value>;
        if (values.length > 25) {
          const fieldTitle = "Results";
          const resultString = commandResult.value.toString();
          const fieldValue =
            replyLength + fieldTitle.length + resultString.length >
            MAX_EMBED_FIELD_LENGTH
              ? resultString.substr(
                  0,
                  MAX_EMBED_FIELD_LENGTH - replyLength - fieldTitle.length - 3
                ) + "..."
              : resultString;
          reply.addField(fieldTitle, fieldValue);
        } else {
          let totalLength = replyLength;
          for (let [index, value] of values.entries()) {
            const fieldTitle = `#${index}`;
            const resultString = value.toString();
            const fieldValue =
              fieldTitle.length + resultString.length > MAX_EMBED_FIELD_LENGTH
                ? resultString.substr(
                    0,
                    MAX_EMBED_FIELD_LENGTH - fieldTitle.length - 3
                  ) + "..."
                : resultString;

            if (
              totalLength + fieldTitle.length + fieldValue.length >
              MAX_EMBED_LENGTH
            ) {
              break;
            } else {
              reply.addField(fieldTitle, fieldValue);
              totalLength += fieldTitle.length + fieldValue.length;
            }
          }
        }

        break;
      case "error":
        reply.setColor("#c90000");
        break;
      default:
        const fieldTitle = "Result";
        const resultString = commandResult.value.toString();
        const fieldValue =
          replyLength + fieldTitle.length + resultString.length >
          MAX_EMBED_FIELD_LENGTH
            ? resultString.substr(
                0,
                MAX_EMBED_FIELD_LENGTH - replyLength - fieldTitle.length - 3
              ) + "..."
            : resultString;
        reply.addField(fieldTitle, fieldValue);
    }

    message.channel.send(reply);
  } catch (e) {
    console.error(e);

    const reply = new Discord.MessageEmbed()
      .setColor("#c90000")
      .setTitle("Execution result")
      .setDescription("There was en error");

    if (typeof e === "string") {
      reply.addField("Error message", e);
    } else if (e instanceof Discord.DiscordAPIError) {
      reply.addField("Error message", e.message);
    } else if (e.expected) {
      reply
        .setDescription("Unknown command syntax")
        .addField(
          "Expected",
          e.expected.map((e) => `\`${e.text ?? e.parts}\``).join(", ")
        )
        .addField(
          "Encountered",
          `\`${e.found}\` on position ${e.location.start.offset}`
        );
    } else {
      reply.setDescription("Unexpected error; contact developers");
      console.error(e);
    }

    message.channel.send(reply);
  }
});

(async () => {
  const secrets = await loadSecrets();

  client.login(secrets.apiToken);
})();
