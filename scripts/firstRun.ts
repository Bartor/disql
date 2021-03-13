import { createInterface } from "readline";
import { writeFile, mkdir } from "fs/promises";
import { CONFIG_FILES_DIR, SECRETS_CONFIG_FILE } from "../configuration";

const secrets: { [key: string]: string } = {};

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
};

(async () => {
  console.log(
    `Welcome to the skript bot configuration script; to re-run this process, type npm run configure`
  );
  secrets["apiToken"] = await question("Enter your api token: ");

  await mkdir(CONFIG_FILES_DIR, { recursive: true });
  await writeFile(SECRETS_CONFIG_FILE, JSON.stringify(secrets));

  rl.close();

  console.log("Configuration is done!");
})();
