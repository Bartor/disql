import { generate } from "pegjs";
import { mkdir, readFile, writeFile } from "fs/promises";
import {
  GENERATED_PARSER_DIR,
  GENERATED_PARSER_PATH,
  GRAMMAR_DEFINITION_FILE,
} from "../configuration";
import { PARSER_IMPORTS } from "../src/parser/parser-imports";

(async () => {
  const grammar = await readFile(GRAMMAR_DEFINITION_FILE, {
    encoding: "utf-8",
  });

  const parserSource = generate(grammar, {
    output: "source",
    format: "commonjs",
  });

  await mkdir(GENERATED_PARSER_DIR, { recursive: true });
  await writeFile(GENERATED_PARSER_PATH, `${PARSER_IMPORTS}${parserSource}`);
})();
