import { join } from "path";

export const CONFIG_FILES_DIR = join(__dirname, "config");
export const SECRETS_CONFIG_FILE = join(CONFIG_FILES_DIR, "secrets.json");
export const GRAMMAR_DEFINITION_FILE = join(
  __dirname,
  "src",
  "parser",
  "grammar.pegjs"
);
export const GENERATED_PARSER_DIR = join(
  __dirname,
  "src",
  "parser",
  "generated"
);
export const GENERATED_PARSER_PATH = join(GENERATED_PARSER_DIR, "parser.ts");
export const COMMAND_PREFIX = "/";
